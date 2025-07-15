import socket

HOST = '0.0.0.0'
PORT = 6000  # Match the Sysmex host port

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen(1)
    print(f"Listening on port {PORT}...")
    conn, addr = s.accept()
    print(f"Connected by {addr}")

    with conn, open("sysmex_data.txt", "wb") as f:
        while True:
            data = conn.recv(1024)
            if not data:
                break
            print(data)
        f.write(data)