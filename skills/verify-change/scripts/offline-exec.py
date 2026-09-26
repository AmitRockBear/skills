import ctypes
import json
import os
from pathlib import Path
import sys

PROFILE = '(version 1)(allow default)(deny network*)'


def main() -> None:
    command = sys.argv[1:]
    if not command:
        raise SystemExit('Usage: python offline-exec.py command [arguments...]')
    if command[0] != '--inside':
        if sys.platform != 'darwin' or not Path('/usr/bin/sandbox-exec').exists():
            raise SystemExit('Offline execution requires the tested macOS sandbox; no unrestricted fallback')
        os.execv('/usr/bin/sandbox-exec', ['sandbox-exec', '-p', PROFILE, sys.executable,
            str(Path(__file__).resolve()), '--inside', *command])
    command = command[1:]
    library = ctypes.CDLL('/usr/lib/libsandbox.dylib')
    library.sandbox_check.restype = ctypes.c_int
    denied = library.sandbox_check(os.getpid(), b'network-outbound', 0)
    if denied != 1:
        raise SystemExit('Network denial could not be verified; refusing to launch')
    environment = {key: value for key, value in os.environ.items()
        if key in {'PATH', 'HOME', 'USER', 'LOGNAME', 'TMPDIR', 'LANG', 'LC_ALL'}}
    print(json.dumps({'offline_execution': True, 'network_outbound_denied': True,
        'credentials_removed_from_environment': True}), file=sys.stderr, flush=True)
    os.execvpe(command[0], command, environment)


if __name__ == '__main__':
    main()
