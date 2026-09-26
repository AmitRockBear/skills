# /// script
# requires-python = ">=3.11"
# dependencies = ["Pillow>=10,<13"]
# ///
import argparse
from collections import Counter
import hashlib
import json
import math
from pathlib import Path
import shutil
import statistics
import subprocess
import os
import sys

from PIL import Image, ImageDraw, ImageOps


# Bound each FFmpeg worker pool so review preparation leaves CPU for other apps.
FFMPEG_THREADS = '2'


def invoke(command: list[str], log: Path) -> None:
    with log.open('w') as stream:
        subprocess.run(command, check=True, stdout=stream, stderr=subprocess.STDOUT)


def probe(path: Path) -> dict:
    return json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams',
        '-show_format', '-of', 'json', str(path)]))


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_plan(path: Path, duration: float) -> list[dict]:
    plan = json.loads(path.read_text())
    if not isinstance(plan, list) or not plan:
        raise ValueError('Plan must be a nonempty array covering the full source')
    previous = 0.0
    for part in plan:
        for field in ('start', 'end', 'speed'):
            value = part.get(field)
            if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
                raise ValueError(f'{field} must be a finite number')
        if abs(part['start'] - previous) > .001 or part['end'] <= part['start']:
            raise ValueError('Plan has a gap, overlap or reversed interval')
        if not .1 <= part['speed'] <= 100:
            raise ValueError('Speed must be between 0.1 and 100')
        caption = part.get('caption')
        if not isinstance(caption, str) or not caption.strip() or len(caption) > 120:
            raise ValueError('Each caption must contain 1–120 characters')
        focus = part.get('focus')
        if focus is not None:
            for field, low, high in [('x', 0, 1), ('y', 0, 1), ('zoom', 1, 2)]:
                value = focus.get(field)
                if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not low <= value <= high:
                    raise ValueError(f'Invalid focus {field}')
        previous = part['end']
    if abs(previous - duration) > .15:
        raise ValueError(f'Plan ends at {previous}; source ends at {duration}')
    plan[-1]['end'] = duration
    return plan


def assemble_frames(directory: Path, output: Path) -> tuple[Path, dict]:
    root = json.loads((directory / 'root.json').read_text())
    frames = [json.loads(line) for line in (directory / 'frames.ndjson').read_text().splitlines()]
    if not frames:
        raise ValueError('No captured frames')
    intervals = [b['timeMs'] - a['timeMs'] for a, b in zip(frames, frames[1:])]
    if any(interval <= 0 for interval in intervals):
        raise ValueError('Capture timestamps must strictly increase')
    dimensions = []
    for frame in frames:
        with Image.open(directory / frame['filename']) as image:
            dimensions.append(image.size)
    width, height = Counter(dimensions).most_common(1)[0][0]
    width += width % 2
    height += height % 2
    median = statistics.median(intervals) if intervals else 200
    end = root.get('captureEndMs', root['captureStartMs'] + frames[-1]['timeMs'] + median) - root['captureStartMs']
    normalized = output / 'normalized-frames'
    normalized.mkdir()
    lines = ['ffconcat version 1.0']
    for index, frame in enumerate(frames):
        source = (directory / frame['filename']).resolve()
        target = normalized / f'{index:06}.png'
        with Image.open(source) as image:
            ImageOps.pad(image.convert('RGB'), (width, height), color='#172033').save(target)
        next_time = frames[index + 1]['timeMs'] if index + 1 < len(frames) else end
        start_time = frame['timeMs'] if index else 0
        if next_time <= start_time:
            raise ValueError('Invalid capture end time')
        lines += [f"file 'normalized-frames/{target.name}'", f'duration {(next_time-start_time)/1000:.6f}']
    lines.append(f"file 'normalized-frames/{len(frames)-1:06}.png'")
    concat = output / 'frames.ffconcat'
    concat.write_text('\n'.join(lines) + '\n')
    raw = output / 'original.mp4'
    invoke(['ffmpeg', '-v', 'error', '-threads', FFMPEG_THREADS,
        '-filter_threads', FFMPEG_THREADS, '-f', 'concat', '-safe', '0', '-i', str(concat), '-r', '10',
        '-c:v', 'libx264', '-threads', FFMPEG_THREADS, '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart', str(raw)], output / 'assemble.log')
    metadata = {'capture_start_ms': root['captureStartMs'], 'frames': len(frames),
        'capture_duration_ms': end, 'mean_capture_fps': len(frames)/(end/1000),
        'dimensions': {f'{w}x{h}': count for (w,h), count in Counter(dimensions).items()},
        'end_inferred': 'captureEndMs' not in root, 'gaps': 'prior frame held',
        'capture_index_sha256': digest(directory / 'frames.ndjson')}
    return raw, metadata


def timestamp(seconds: float) -> str:
    millis = round(seconds * 1000)
    hours, millis = divmod(millis, 3600000)
    minutes, millis = divmod(millis, 60000)
    seconds, millis = divmod(millis, 1000)
    return f'{hours:02}:{minutes:02}:{seconds:02},{millis:03}'


def render(args: argparse.Namespace) -> None:
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=False)
    capture = {}
    if args.frames:
        original, capture = assemble_frames(args.frames.resolve(), output)
    else:
        original = output / ('original' + args.source.suffix)
        shutil.copy2(args.source, original)
    info = probe(original)
    duration = float(info['format']['duration'])
    if any(stream['codec_type'] == 'audio' for stream in info['streams']):
        raise ValueError('This helper supports silent capture; retain audio and use an audio-aware edit path')
    video = next(stream for stream in info['streams'] if stream['codec_type'] == 'video')
    width, height = video['width'], video['height']
    plan = read_plan(args.plan, duration)
    clicks = []
    if args.clicks:
        origin = args.capture_start_ms if args.capture_start_ms is not None else capture.get('capture_start_ms')
        if origin is None:
            raise ValueError('Native recordings need --capture-start-ms for wall-clock click data')
        for line in args.clicks.read_text().splitlines():
            click = json.loads(line)
            t = (click['at'] - origin)/1000
            if 0 <= t <= duration and all(isinstance(click.get(k), (int,float)) and 0 <= click[k] <= 1 for k in ('cx','cy')):
                clicks.append((t, click['cx'], click['cy']))
    ring = Image.new('RGBA', (64,64))
    draw = ImageDraw.Draw(ring)
    draw.ellipse((5,5,59,59), fill=(25,210,255,35), outline=(25,210,255,255), width=4)
    draw.ellipse((1,1,63,63), outline=(255,255,255,220), width=2)
    ring.save(output / 'click-ring.png')
    filters = []
    previous = '0:v'
    if clicks:
        filters.append('[1:v]split=' + str(len(clicks)) + ''.join(f'[c{i}]' for i in range(len(clicks))))
        for index, (t,x,y) in enumerate(clicks):
            filters.append(f"[{previous}][c{index}]overlay=x={x*width-32:.2f}:y={y*height-32:.2f}:enable='between(t,{t:.3f},{t+1.4:.3f})'[v{index}]")
            previous = f'v{index}'
    scale = min(1920/width, 1080/height)
    scaled_width, scaled_height = round(width*scale/2)*2, round(height*scale/2)*2
    filters.append(f'[{previous}]scale={scaled_width}:{scaled_height},pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0x172033,setsar=1[framed]')
    command = ['ffmpeg','-v','error','-threads',FFMPEG_THREADS,
        '-filter_complex_threads',FFMPEG_THREADS,'-i',str(original)]
    if clicks:
        command += ['-loop','1','-threads',FFMPEG_THREADS,'-i',str(output/'click-ring.png')]
    command += ['-filter_complex',';'.join(filters),'-map','[framed]','-t',str(duration),'-c:v','libx264',
        '-threads',FFMPEG_THREADS,'-preset','fast','-crf','18','-pix_fmt','yuv420p',str(output/'framed.mp4')]
    invoke(command, output/'framing.log')
    speeds, zooms, annotations, mapping = [], [], [], []
    elapsed = 0.0
    for index, part in enumerate(plan):
        start, end, speed = part['start'], part['end'], part['speed']
        speeds.append({'id':f's{index}','startMs':round(start*1000),'endMs':round(end*1000),'speed':speed})
        if focus := part.get('focus'):
            zooms.append({'id':f'z{index}','startMs':round(start*1000),'endMs':round(end*1000),
                'depth':2,'customScale':focus['zoom'],'focus':{'cx':.5+(focus['x']-.5)*scaled_width/1920,
                'cy':.5+(focus['y']-.5)*scaled_height/1080},'focusMode':'manual','source':'manual'})
        caption = part['caption'] + (f' | {speed:g}x' if args.speed_labels else '')
        annotations.append({'id':f'a{index}','startMs':round(start*1000),'endMs':round(end*1000),
            'type':'text','content':caption,'textContent':caption,'position':{'x':2,'y':90},
            'size':{'width':96,'height':8},'style':{'fontSize':29,'color':'#ffffff','backgroundColor':'#172033',
            'fontFamily':'Arial','fontWeight':'bold','fontStyle':'normal','textDecoration':'none','textAlign':'center'},'zIndex':10})
        length = (end-start)/speed
        mapping.append({'source_start_s':start,'source_end_s':end,'speed':speed,'output_start_s':elapsed,
            'output_end_s':elapsed+length,'caption':part['caption'],'focus':part.get('focus')})
        elapsed += length
    project = {'version':2,'media':{'screenVideoPath':str(output/'framed.mp4'),'cursorCaptureMode':'system'},
        'editor':{'wallpaper':'#172033','padding':35,'borderRadius':14,'aspectRatio':'16:9',
        'exportQuality':'good','exportFormat':'mp4','speedRegions':speeds,'zoomRegions':zooms,'annotationRegions':annotations}}
    project_path = output/'review.openscreen'
    project_path.write_text(json.dumps(project, indent=2))
    env = dict(os.environ)
    env.pop('ELECTRON_RUN_AS_NODE', None)
    with (output/'openscreen.log').open('w') as log:
        subprocess.run([str(args.openscreen.resolve()),'--no-sandbox','export',str(project_path),'-o',str(output/'render.mp4'),'--json'],
            env=env,check=True,stdout=log,stderr=subprocess.STDOUT)
    final = output/'review.mp4'
    invoke(['ffmpeg','-v','error','-threads',FFMPEG_THREADS,'-filter_threads',FFMPEG_THREADS,
        '-i',str(output/'render.mp4'),'-an','-vf','setsar=1','-c:v','libx264',
        '-threads',FFMPEG_THREADS,'-preset','fast','-crf','22','-pix_fmt','yuv420p',
        '-movflags','+faststart',str(final)],output/'encode.log')
    result = probe(final)
    if abs(float(result['format']['duration'])-elapsed) > .25:
        raise ValueError('Rendered duration does not match the speed plan')
    invoke(['ffmpeg','-v','error','-threads',FFMPEG_THREADS,'-filter_threads',FFMPEG_THREADS,
        '-i',str(final),'-f','null','-'],output/'decode.log')
    receipt = {'source_sha256':digest(original),'source_duration_s':duration,'output_sha256':digest(final),
        'output_duration_s':float(result['format']['duration']),'segments':mapping,'capture':capture,
        'network_policy':'macOS sandbox deny network*; inherited by renderer and encoders',
        'highlighted_clicks':len(clicks),'full_decode_passed':True,'visual_review':'required before delivery'}
    (output/'mapping.json').write_text(json.dumps(receipt,indent=2))
    (output/'transcript.srt').write_text('\n\n'.join(f'{i+1}\n{timestamp(p["output_start_s"])} --> {timestamp(p["output_end_s"])}\n{p["caption"]}' for i,p in enumerate(mapping))+'\n')
    print(json.dumps({'video':str(final),'duration':elapsed,'bytes':final.stat().st_size,'visual_review':'required'}))


if __name__ == '__main__':
    if '--offline-worker' not in sys.argv:
        os.execv(sys.executable, [sys.executable, str(Path(__file__).with_name('offline-exec.py')),
            sys.executable, str(Path(__file__).resolve()), '--offline-worker', *sys.argv[1:]])
    sys.argv.remove('--offline-worker')
    import ctypes
    sandbox = ctypes.CDLL('/usr/lib/libsandbox.dylib')
    if sandbox.sandbox_check(os.getpid(), b'network-outbound', 0) != 1:
        raise SystemExit('Rendering requires verified network denial')
    parser = argparse.ArgumentParser()
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument('--source', type=Path)
    source.add_argument('--frames', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--plan', type=Path, required=True)
    parser.add_argument('--openscreen', type=Path, required=True)
    parser.add_argument('--clicks', type=Path)
    parser.add_argument('--capture-start-ms', type=int)
    parser.add_argument('--speed-labels', action='store_true')
    render(parser.parse_args())
