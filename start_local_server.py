#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
from pathlib import Path

PORT = 8765
ROOT = Path(__file__).resolve().parent

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

def main():
    url = f"http://127.0.0.1:{PORT}/index.html"
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print("Mario Kart World Cup lokal gestartet unter:")
        print(url)
        print("Mit Strg+C beenden.")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        httpd.serve_forever()

if __name__ == "__main__":
    main()
