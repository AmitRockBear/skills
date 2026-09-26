import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

from PIL import Image

spec = importlib.util.spec_from_file_location('render_video', Path(__file__).with_name('render-video.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class VideoEvidenceTests(unittest.TestCase):
    def test_plan_preserves_all_source_time(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp)/'plan.json'
            valid = [{'start':0,'end':2,'speed':1,'caption':'Click'},
                     {'start':2,'end':10,'speed':8,'caption':'Wait'}]
            path.write_text(json.dumps(valid))
            self.assertEqual(module.read_plan(path,10), valid)
            for patch in [{'start':3}, {'start':1}, {'speed':0}, {'caption':''}]:
                broken = [valid[0], dict(valid[1], **patch)]
                path.write_text(json.dumps(broken))
                with self.assertRaises(ValueError):
                    module.read_plan(path,10)

    def test_timestamped_frames_retain_gaps_and_popup_geometry(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp); frames=root/'frames'; output=root/'output'
            frames.mkdir();output.mkdir()
            (frames/'root.json').write_text(json.dumps({'captureStartMs':1000,'captureEndMs':2000}))
            for i,size in enumerate([(640,480),(100,200),(640,480)]):
                Image.new('RGB',size,'white').save(frames/f'{i}.jpg')
            (frames/'frames.ndjson').write_text('\n'.join(json.dumps({'filename':f'{i}.jpg','timeMs':t}) for i,t in enumerate([0,100,900])))
            raw, receipt = module.assemble_frames(frames,output)
            self.assertAlmostEqual(float(module.probe(raw)['format']['duration']),1,delta=.15)
            self.assertEqual(receipt['dimensions'],{'640x480':2,'100x200':1})
            with Image.open(output/'normalized-frames/000001.png') as image:
                self.assertEqual(image.size,(640,480))
                self.assertEqual(image.getpixel((0,0)),(23,32,51))
                self.assertEqual(image.getpixel((320,240)),(255,255,255))


if __name__ == '__main__':
    unittest.main()
