#!/usr/bin/env python3
"""
Lightweight development server for Adwizen with HTTP Range request support
for smooth video streaming and scrubbing.
"""
import os
import re
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

class RangeRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def send_head(self):
        self._range_length = None
        if 'Range' not in self.headers:
            return super().send_head()

        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            return super().send_head()

        ctype = self.guess_type(path)
        try:
            f = open(path, 'rb')
        except OSError:
            self.send_error(404, "File not found")
            return None

        fs = os.fstat(f.fileno())
        total_len = fs.st_size

        range_header = self.headers.get('Range', '')
        range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)

        if not range_match:
            return super().send_head()

        first_byte = int(range_match.group(1))
        last_byte_str = range_match.group(2)
        last_byte = int(last_byte_str) if last_byte_str else total_len - 1

        if first_byte >= total_len or last_byte >= total_len or first_byte > last_byte:
            self.send_error(416, "Requested Range Not Satisfiable")
            self.send_header('Content-Range', f'bytes */{total_len}')
            self.end_headers()
            f.close()
            return None

        length = last_byte - first_byte + 1
        self._range_length = length
        self.send_response(206, 'Partial Content')
        self.send_header('Content-type', ctype)
        self.send_header('Content-Range', f'bytes {first_byte}-{last_byte}/{total_len}')
        self.send_header('Content-Length', str(length))
        self.send_header('Last-Modified', self.date_time_string(fs.st_mtime))
        self.end_headers()

        f.seek(first_byte)
        return f

    def copyfile(self, source, outputfile):
        """Send only the requested range bytes, suppressing client disconnection errors."""
        try:
            if hasattr(self, '_range_length') and self._range_length is not None:
                remaining = self._range_length
                buf_size = 64 * 1024
                while remaining > 0:
                    read_size = min(buf_size, remaining)
                    buf = source.read(read_size)
                    if not buf:
                        break
                    outputfile.write(buf)
                    remaining -= len(buf)
            else:
                super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def handle(self):
        try:
            super().handle()
        except (BrokenPipeError, ConnectionResetError):
            pass

def run(port=8080):
    server_address = ('', port)
    httpd = ThreadingHTTPServer(server_address, RangeRequestHandler)
    httpd.daemon_threads = True
    print(f"Serving Adwizen on http://localhost:{port} (Multi-threaded + Range requests enabled)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    run(port)
