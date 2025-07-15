import socket
from django.core.management.base import BaseCommand
from core.parser import parse_sysmex_data_block

class Command(BaseCommand):
    help = 'Start TCP listener to receive Sysmex data and store it by sample_id'

    def handle(self, *args, **kwargs):
        HOST = '0.0.0.0'
        PORT = 6000

        self.stdout.write(self.style.SUCCESS(f"[TCP] Listening on {PORT}..."))

        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind((HOST, PORT))
            s.listen(1)

            conn, addr = s.accept()
            self.stdout.write(self.style.SUCCESS(f"[TCP] Connected by {addr}"))

            data_block = b''
            with conn:
                while True:
                    data = conn.recv(1024)
                    if not data:
                        break
                    data_block += data

            parse_sysmex_data_block(data_block)
            self.stdout.write(self.style.SUCCESS(f"[TCP] Finished parsing Sysmex data."))
