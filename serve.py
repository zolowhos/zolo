#!/usr/bin/env python3
"""Local dev server for the portfolio. Kills the old listener on PORT first."""

from __future__ import annotations

import http.server
import os
import socket
import subprocess
import sys
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = int(os.environ.get("PORT", "8080"))
GUIDE_URL = f"http://127.0.0.1:{PORT}/#1"


class DevHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        # Dev: always fetch fresh JS/CSS/MD so copy-button updates show up.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stdout.write("%s - - [%s] %s\n" % (self.address_string(), self.log_date_time_string(), fmt % args))


def kill_port(port: int) -> None:
    if os.name != "nt":
        return
    try:
        out = subprocess.check_output(["netstat", "-ano"], text=True, errors="ignore")
    except (subprocess.CalledProcessError, FileNotFoundError):
        return
    for line in out.splitlines():
        if f":{port}" not in line or "LISTENING" not in line:
            continue
        parts = line.split()
        if not parts:
            continue
        pid = parts[-1]
        if not pid.isdigit() or int(pid) == os.getpid():
            continue
        print(f"Stopping old server on port {port} (PID {pid})")
        subprocess.run(["taskkill", "/F", "/PID", pid], capture_output=True)


def port_free(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", port))
            return True
        except OSError:
            return False


def main() -> None:
    os.chdir(ROOT)
    kill_port(PORT)
    if not port_free(PORT):
        print(f"Port {PORT} is still in use. Try: set PORT=8081 && python serve.py")
        sys.exit(1)

    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), DevHandler)
    print(f"Serving {ROOT}")
    print(f"Guide:  {GUIDE_URL}")
    print(f"Home:   http://127.0.0.1:{PORT}/index.html")
    print("Ctrl+C to stop")

    if "--no-open" not in sys.argv:
        webbrowser.open(GUIDE_URL)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        httpd.server_close()


if __name__ == "__main__":
    main()
