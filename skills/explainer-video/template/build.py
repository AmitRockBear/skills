"""Builds narration + music audio (build/audio.wav) and timeline.js from script.json.
Env: VOICE (Kokoro voice, default af_heart), SPEED (default 1.0), EXPLAINER_VIDEO_CACHE (holds kokoro/ models)."""
import hashlib, json, os, subprocess, wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).parent
CACHE = ROOT / "build" / "voice"
CACHE.mkdir(parents=True, exist_ok=True)
SR, FPS = 48000, 30
VOICE, SPEED = os.environ.get("VOICE", "af_heart"), float(os.environ.get("SPEED", "1.0"))
MODELS = Path(os.environ.get("EXPLAINER_VIDEO_CACHE", Path.home() / ".cache/explainer-video")) / "kokoro"
KOKORO = None
LEAD_IN, GAP, SCENE_GAP, TAIL = 1.0, 0.3, 0.6, 1.0


def tts(text: str) -> np.ndarray:
    global KOKORO
    key = hashlib.sha1(f"kokoro{VOICE}{SPEED}{text}".encode()).hexdigest()[:16]
    wav = CACHE / f"{key}.wav"
    if not wav.exists():
        import soundfile as sf
        from kokoro_onnx import Kokoro
        KOKORO = KOKORO or Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))
        samples, sr = KOKORO.create(text, voice=VOICE, speed=SPEED, lang="en-us")
        raw = CACHE / f"{key}.raw.wav"
        sf.write(raw, samples, sr)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-ac", "1", "-ar", str(SR), str(wav)], check=True)
        raw.unlink()
    with wave.open(str(wav)) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def music(n: int) -> np.ndarray:
    t = np.arange(n) / SR
    bar = 60 / 80 * 4
    chords = [[48, 52, 55, 59], [45, 48, 52, 55], [41, 45, 48, 52], [43, 47, 50, 52]]  # Cmaj7 Am7 Fmaj7 G6
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    out = np.zeros(n, np.float32)
    nbars = int(n / SR / bar) + 1
    for b in range(nbars):
        ch = chords[b % 4]
        s0, s1 = int(b * bar * SR), min(n, int((b + 1) * bar * SR + 1.5 * SR))
        if s0 >= n:
            break
        tt = t[s0:s1] - b * bar
        env = np.minimum(tt / 0.9, 1) * np.clip((bar + 1.5 - tt) / 1.5, 0, 1)
        pad = sum(np.sin(2 * np.pi * hz(m + 12) * tt) + 0.5 * np.sin(2 * np.pi * hz(m + 12) * 1.003 * tt) for m in ch)
        bass = np.sin(2 * np.pi * hz(ch[0] - 12) * tt)
        out[s0:s1] += (0.05 * pad + 0.12 * bass) * env
        for k in range(8):  # eighth-note pluck arpeggio
            p0 = s0 + int(k * bar / 8 * SR)
            if p0 >= n:
                break
            m = ch[[0, 1, 2, 3, 2, 1, 2, 3][k]] + 24
            pt = np.arange(min(int(1.2 * SR), n - p0)) / SR
            out[p0:p0 + len(pt)] += 0.07 * np.sin(2 * np.pi * hz(m) * pt) * np.exp(-pt * 5) * np.minimum(pt / 0.005, 1)
    return out


def main():
    lines = json.loads((ROOT / "script.json").read_text())
    clips, t, prev_scene = [], LEAD_IN, None
    timeline = []
    for i, ln in enumerate(lines):
        if prev_scene and ln["scene"] != prev_scene:
            t += SCENE_GAP
        audio = tts(ln.get("say", ln["cap"]))
        timeline.append({"scene": ln["scene"], "cap": ln["cap"], "start": round(t, 3), "end": round(t + len(audio) / SR, 3)})
        clips.append((t, audio))
        t += len(audio) / SR + GAP + ln.get("hold", 0)
        prev_scene = ln["scene"]
    total = t + TAIL
    n = int(total * SR)
    voice = np.zeros(n, np.float32)
    for start, a in clips:
        s = int(start * SR)
        voice[s:s + len(a)] += a[: n - s]

    hop = SR // FPS
    frames = int(total * FPS)
    rms = np.array([np.sqrt(np.mean(voice[i * hop:(i + 1) * hop] ** 2)) for i in range(frames)])
    env = np.clip(rms / (np.percentile(rms[rms > 0.01], 90) + 1e-6), 0, 1)

    # Duck music under the voice, fade in/out.
    active = np.convolve((rms > 0.01).astype(float), np.ones(20) / 20, mode="same")
    duck = np.interp(np.arange(n) / SR, np.arange(frames) / FPS, 1 - 0.5 * np.clip(active * 2, 0, 1))
    fade = np.clip(np.arange(n) / SR / 2, 0, 1) * np.clip((total - np.arange(n) / SR) / 3, 0, 1)
    mix = voice * 0.9 + music(n) * 0.22 * duck * fade
    mix /= max(1.0, np.abs(mix).max() / 0.95)

    with wave.open(str(ROOT / "build" / "audio.wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())
    data = {"fps": FPS, "duration": round(total, 3), "lines": timeline, "env": [round(float(x), 2) for x in env]}
    (ROOT / "timeline.js").write_text("window.TIMELINE = " + json.dumps(data) + ";\n")
    print(f"duration {total:.1f}s, {len(lines)} lines")


if __name__ == "__main__":
    main()
