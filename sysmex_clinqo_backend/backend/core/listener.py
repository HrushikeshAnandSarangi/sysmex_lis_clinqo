import socket
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from core.parser import parse_sysmex_data_block, parse_sysmex_file

HOST = '0.0.0.0'
PORT = 6000

def start_tcp_listener():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen(1)
        print(f"[TCP] Listening on port {PORT}...")

        conn, addr = s.accept()
        print(f"[TCP] Connected by {addr}")

        data_block = b""
        with conn:
            while True:
                data = conn.recv(1024)
                if not data:
                    break
                data_block += data

        parse_sysmex_data_block(data_block)


def upload_file_and_parse(path: str):
    if not os.path.exists(path):
        print(f"[FILE] File not found: {path}")
        return
    parse_sysmex_file(path)


if __name__ == "__main__":
    mode = input("Enter mode (tcp/file): ").strip().lower()

    if mode == "tcp":
        start_tcp_listener()
    elif mode == "file":
        file_path = input("Enter full path to .txt file: ").strip()
        upload_file_and_parse(file_path)
    else:
        print("Invalid mode. Use 'tcp' or 'file'.")
