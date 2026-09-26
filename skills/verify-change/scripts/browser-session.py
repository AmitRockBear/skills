# /// script
# requires-python = ">=3.11"
# dependencies = ["playwright==1.56.0"]
# ///
import argparse
import asyncio
import json
import os
from pathlib import Path
import signal
import socket
import time

from playwright.async_api import async_playwright


OBSERVER = """(() => {
  if (window !== window.top || window.__verifyChangeObserved) return;
  window.__verifyChangeObserved = true;
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const box = target.getBoundingClientRect();
    const measured = event.clientX !== 0 || event.clientY !== 0;
    const x = measured ? event.clientX : box.x + box.width / 2;
    const y = measured ? event.clientY : box.y + box.height / 2;
    window.__verifyChangeClick({at: Date.now(), clientX: x, clientY: y,
      cx: x / outerWidth, cy: (y + outerHeight - innerHeight) / outerHeight,
      outerWidth, outerHeight, innerWidth, innerHeight,
      coordinateSource: measured ? 'event' : 'target-center',
      label: target.closest('button,a,[role="button"]')?.getAttribute('aria-label') ||
        target.textContent?.trim().slice(0, 80) || ''});
  }, true);
})();"""


def append(path: Path, value: object) -> None:
    with path.open('a') as stream:
        stream.write(json.dumps(value) + '\n')


async def run(args: argparse.Namespace) -> None:
    root = args.run.resolve()
    root.mkdir(parents=True, exist_ok=False, mode=0o700)
    os.chmod(root, 0o700)
    (root / 'downloads').mkdir()
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, stop.set)
    async with async_playwright() as playwright:
        flags = [f'--remote-debugging-port={port}', '--remote-debugging-address=127.0.0.1',
                 f'--window-size={args.width},{args.height}', '--disable-features=Translate']
        if args.extension:
            extensions = ','.join(str(path.resolve()) for path in args.extension)
            flags += ['--disable-extensions-except=' + extensions, '--load-extension=' + extensions]
        context = await playwright.chromium.launch_persistent_context(
            str(root / 'profile'), executable_path=str(args.executable) if args.executable else None,
            channel=None if args.executable else 'chromium', headless=False, no_viewport=True,
            accept_downloads=True, args=flags)
        pending: set[asyncio.Task] = set()
        count = 0

        async def save(download) -> None:
            nonlocal count
            count += 1
            filename = Path(download.suggested_filename.replace('\\', '/')).name
            destination = root / 'downloads' / f'{count:03}-{filename}'
            try:
                await download.save_as(destination)
                if destination.stat().st_size == 0:
                    raise RuntimeError('Browser saved an empty download; inspect the real download before claiming success')
                append(root / 'downloads.ndjson', {'at': time.time_ns() // 1_000_000,
                    'filename': filename, 'path': str(destination), 'bytes': destination.stat().st_size,
                    'url': download.url, 'status': 'completed'})
            except Exception as error:
                append(root / 'downloads.ndjson', {'filename': filename, 'status': 'failed', 'error': str(error)})

        def hook(page) -> None:
            def download_started(download) -> None:
                task = asyncio.create_task(save(download))
                pending.add(task)
                task.add_done_callback(pending.discard)
            page.on('download', download_started)
            page.on('pageerror', lambda error: append(root / 'browser-errors.ndjson',
                {'at': time.time_ns() // 1_000_000, 'error': str(error)}) if (root / 'CAPTURE').exists() else None)
            page.on('console', lambda message: append(root / 'browser-console.ndjson',
                {'at': time.time_ns() // 1_000_000, 'type': message.type, 'text': message.text})
                if (root / 'CAPTURE').exists() and message.type in ('error', 'warning') else None)

        async def record_click(source, event) -> None:
            if (root / 'CAPTURE').exists():
                append(root / 'clicks.ndjson', event)

        await context.expose_binding('__verifyChangeClick', record_click)
        await context.add_init_script(OBSERVER)
        context.on('page', hook)
        for page in context.pages:
            hook(page)
        page = context.pages[0] if context.pages else await context.new_page()
        await page.goto(args.url)
        if context.browser is None:
            raise RuntimeError('Cannot establish browser process ownership')
        session = await context.browser.new_browser_cdp_session()
        processes = await session.send('SystemInfo.getProcessInfo')
        await session.detach()
        browser_pid = next(process['id'] for process in processes['processInfo'] if process['type'] == 'browser')
        manifest = {'host_pid': os.getpid(), 'browser_pid': browser_pid, 'started_at_ms': time.time_ns() // 1_000_000,
                    'url': args.url, 'profile': str(root / 'profile'), 'cdp_port': port,
                    'browser_version': context.browser.version if context.browser else None,
                    'executable': str(args.executable or playwright.chromium.executable_path),
                    'extensions': [str(path.resolve()) for path in args.extension]}
        (root / 'browser.json').write_text(json.dumps(manifest, indent=2))
        print(json.dumps(manifest), flush=True)
        try:
            while not stop.is_set() and not (root / 'STOP').exists():
                try:
                    await asyncio.wait_for(stop.wait(), timeout=.5)
                except TimeoutError:
                    pass
            if pending:
                await asyncio.wait_for(asyncio.gather(*pending), timeout=30)
        finally:
            await context.close()
            (root / 'stopped.json').write_text(json.dumps({'at': time.time_ns() // 1_000_000}))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('run', type=Path)
    parser.add_argument('--url', required=True)
    parser.add_argument('--executable', type=Path)
    parser.add_argument('--extension', type=Path, action='append', default=[])
    parser.add_argument('--width', type=int, default=1440)
    parser.add_argument('--height', type=int, default=1000)
    asyncio.run(run(parser.parse_args()))


if __name__ == '__main__':
    main()
