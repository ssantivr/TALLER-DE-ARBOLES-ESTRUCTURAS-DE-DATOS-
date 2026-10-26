import json
import os
import re
import socket
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlparse

from tree import NUMBERS_EXAMPLE, PERFECT_DEMO, SEED_DEVELOPERS, BinaryTree, NumberTree, random_developers

HOST = "127.0.0.1"
PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
MAX_NODES = 300
MAX_NUMBERS = 40
NAME_PATTERN = re.compile(r"^[^\W\d_](?:[^\W_]|[ .'\-]){0,39}$")
PHONE_PATTERN = re.compile(r"^\+?[0-9][0-9 ()\-]{5,18}[0-9]$")
CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon",
}
TRAVERSALS = {
    "inorder": "in_order_asc",
    "inorder_desc": "in_order_desc",
    "preorder": "pre_order",
    "postorder": "post_order",
    "levelorder": "level_order",
}
GET_ROUTES = {"/api/tree", "/api/metrics", "/api/traversal", "/api/search", "/api/compare",
              "/api/longest_path", "/api/numbers/sorted"}
POST_ROUTES = {"/api/insert", "/api/update", "/api/delete", "/api/seed", "/api/demo_perfect",
               "/api/random", "/api/rebalance", "/api/clear", "/api/numbers/add",
               "/api/numbers/example", "/api/numbers/clear"}

directory = BinaryTree()
numbers = NumberTree()
lock = threading.Lock()


class ApiError(Exception):
    def __init__(self, status, message):
        super().__init__(message)
        self.status = status
        self.message = message


def clean_name(value):
    if not isinstance(value, str) or not value.strip():
        raise ApiError(400, "El nombre es obligatorio")
    name = " ".join(value.split())
    if not NAME_PATTERN.match(name):
        raise ApiError(400, "Nombre inválido: usa letras, espacios y máximo 40 caracteres")
    return name


def clean_phone(value):
    if not isinstance(value, str) or not value.strip():
        raise ApiError(400, "El teléfono es obligatorio")
    phone = value.strip()
    if not PHONE_PATTERN.match(phone):
        raise ApiError(400, "Teléfono inválido: usa dígitos, espacios o guiones (7 a 20 caracteres)")
    return phone


def clean_role(value):
    if value is None:
        return ""
    if not isinstance(value, str) or len(value.strip()) > 24:
        raise ApiError(400, "Rol inválido (máximo 24 caracteres)")
    return value.strip()


def clean_stack(value):
    if value is None:
        return []
    if isinstance(value, str):
        items = value.split(",")
    elif isinstance(value, list):
        items = value
    else:
        raise ApiError(400, "Stack inválido")
    stack = []
    for item in items:
        if not isinstance(item, str):
            raise ApiError(400, "Stack inválido")
        text = " ".join(item.split())
        if not text:
            continue
        if len(text) > 24:
            raise ApiError(400, "Cada tecnología admite máximo 24 caracteres")
        stack.append(text)
    if len(stack) > 8:
        raise ApiError(400, "Máximo 8 tecnologías en el stack")
    return stack


def clean_int(value, low, high, label):
    if isinstance(value, bool):
        raise ApiError(400, f"{label} inválido")
    if isinstance(value, str) and re.fullmatch(r"-?\d+", value.strip()):
        value = int(value.strip())
    if not isinstance(value, int):
        raise ApiError(400, f"{label} inválido")
    if not low <= value <= high:
        raise ApiError(400, f"{label} debe estar entre {low} y {high}")
    return value


def query_value(query, key):
    values = query.get(key)
    return values[0] if values else ""


def load_developers(rows):
    directory.clear()
    for name, phone, role, stack in rows:
        directory.insert(name, phone, role, stack)


def snapshot():
    return {"tree": directory.to_dict(), "metrics": directory.metrics()}


def numbers_state(order="asc"):
    sequence = numbers.in_order_asc() if order == "asc" else numbers.in_order_desc()
    return {"order": order, "sequence": sequence, "values": [item["value"] for item in sequence],
            "insertion": list(numbers.insertion), "count": numbers.count(), "tree": numbers.to_dict()}


def load_numbers(values):
    numbers.clear()
    for value in values:
        numbers.add(value)


def handle_get(path, query):
    if path == "/api/tree":
        return 200, snapshot()
    if path == "/api/metrics":
        return 200, directory.metrics()
    if path == "/api/traversal":
        kind = query_value(query, "type") or "inorder"
        if kind not in TRAVERSALS:
            raise ApiError(400, "Tipo de recorrido inválido")
        return 200, {"type": kind, "sequence": getattr(directory, TRAVERSALS[kind])()}
    if path == "/api/search":
        name = clean_name(query_value(query, "name"))
        return 200, directory.search(name)
    if path == "/api/compare":
        name = clean_name(query_value(query, "name"))
        result = directory.search(name)
        return 200, {"name": name, "weight": directory.weight(),
                     "tree": {"steps": result["steps"], "path": result["path"], "found": result["found"]},
                     "list": directory.linear_search_steps(name)}
    if path == "/api/longest_path":
        path_names = directory.longest_path()
        return 200, {"path": path_names, "length": len(path_names), "height": directory.height()}
    if path == "/api/numbers/sorted":
        order = query_value(query, "order") or "asc"
        if order not in ("asc", "desc"):
            raise ApiError(400, "Orden inválido: usa asc o desc")
        return 200, numbers_state(order)
    if path in POST_ROUTES:
        raise ApiError(405, "Método no permitido: usa POST")
    raise ApiError(404, "Ruta no encontrada")


def handle_post(path, body):
    if path == "/api/insert":
        name = clean_name(body.get("name"))
        phone = clean_phone(body.get("phone"))
        role = clean_role(body.get("role"))
        stack = clean_stack(body.get("stack"))
        if directory.weight() >= MAX_NODES and not directory.search(name)["found"]:
            raise ApiError(409, f"El árbol alcanzó el límite de {MAX_NODES} nodos")
        result = directory.insert(name, phone, role, stack)
        return (201 if result["action"] == "created" else 200), {"result": result, **snapshot()}
    if path == "/api/update":
        name = clean_name(body.get("name"))
        phone = clean_phone(body["phone"]) if body.get("phone") else None
        role = clean_role(body["role"]) if body.get("role") is not None else None
        stack = clean_stack(body["stack"]) if body.get("stack") is not None else None
        if phone is None and role is None and stack is None:
            raise ApiError(400, "No hay datos para actualizar")
        result = directory.update(name, phone, role, stack)
        if result is None:
            raise ApiError(404, f"{name} no existe en el directorio")
        return 200, {"result": result, **snapshot()}
    if path == "/api/delete":
        name = clean_name(body.get("name"))
        result = directory.delete(name)
        if result is None:
            raise ApiError(404, f"{name} no existe en el directorio")
        return 200, {"result": result, **snapshot()}
    if path == "/api/seed":
        load_developers(SEED_DEVELOPERS)
        return 200, snapshot()
    if path == "/api/demo_perfect":
        load_developers(PERFECT_DEMO)
        return 200, snapshot()
    if path == "/api/random":
        count = clean_int(body.get("count", 12), 1, 60, "La cantidad")
        load_developers(random_developers(count))
        return 200, snapshot()
    if path == "/api/rebalance":
        before = directory.metrics()
        directory.rebalance()
        return 200, {"before": before, **snapshot()}
    if path == "/api/clear":
        directory.clear()
        return 200, snapshot()
    if path == "/api/numbers/add":
        raw = body.get("values") if "values" in body else [body.get("value")]
        if not isinstance(raw, list) or not raw:
            raise ApiError(400, "Envía al menos un número")
        values = [clean_int(item, -999, 999, "El número") for item in raw]
        if numbers.count() + len(values) > MAX_NUMBERS:
            raise ApiError(409, f"Máximo {MAX_NUMBERS} números en el árbol")
        for value in values:
            numbers.add(value)
        return 200, numbers_state()
    if path == "/api/numbers/example":
        load_numbers(NUMBERS_EXAMPLE)
        return 200, numbers_state()
    if path == "/api/numbers/clear":
        numbers.clear()
        return 200, numbers_state()
    if path in GET_ROUTES:
        raise ApiError(405, "Método no permitido: usa GET")
    raise ApiError(404, "Ruta no encontrada")


class Handler(BaseHTTPRequestHandler):
    server_version = "TreeLab/1.0"

    def log_message(self, fmt, *args):
        pass

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self.dispatch(lambda: handle_get(parsed.path, parse_qs(parsed.query)))
        else:
            self.serve_static(parsed.path)

    def do_POST(self):
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/"):
            self.send_json(405, {"error": "Método no permitido", "status": 405})
            return
        self.dispatch(lambda: handle_post(parsed.path, self.read_body()))

    def dispatch(self, action):
        try:
            with lock:
                status, payload = action()
        except ApiError as error:
            status, payload = error.status, {"error": error.message, "status": error.status}
        except Exception as error:
            status, payload = 500, {"error": f"Error interno: {error}", "status": 500}
        self.send_json(status, payload)

    def read_body(self):
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            raise ApiError(400, "Content-Length inválido")
        if length > 1_000_000:
            raise ApiError(413, "Cuerpo demasiado grande")
        raw = self.rfile.read(length) if length else b""
        if not raw.strip():
            return {}
        try:
            body = json.loads(raw.decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            raise ApiError(400, "JSON inválido")
        if not isinstance(body, dict):
            raise ApiError(400, "Se esperaba un objeto JSON")
        return body

    def send_json(self, status, payload):
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def serve_static(self, path):
        path = unquote(path)
        if path in ("/", "/index.html"):
            relative = "index.html"
        elif path.startswith("/static/"):
            relative = path[len("/static/"):]
        elif path == "/favicon.ico":
            self.send_response(204)
            self.end_headers()
            return
        else:
            self.send_json(404, {"error": "Recurso no encontrado", "status": 404})
            return
        root = os.path.realpath(STATIC_DIR)
        target = os.path.realpath(os.path.join(root, relative))
        if not target.startswith(root + os.sep) or not os.path.isfile(target):
            self.send_json(404, {"error": "Recurso no encontrado", "status": 404})
            return
        with open(target, "rb") as handle:
            data = handle.read()
        extension = os.path.splitext(target)[1].lower()
        self.send_response(200)
        self.send_header("Content-Type", CONTENT_TYPES.get(extension, "application/octet-stream"))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


class IPv6Server(ThreadingHTTPServer):
    address_family = socket.AF_INET6


def main():
    load_developers(SEED_DEVELOPERS)
    load_numbers(NUMBERS_EXAMPLE)
    servers = [ThreadingHTTPServer((HOST, PORT), Handler)]
    try:
        servers.append(IPv6Server(("::1", PORT), Handler))
    except OSError:
        pass
    for extra in servers[1:]:
        threading.Thread(target=extra.serve_forever, daemon=True).start()
    print(f"TreeLab escuchando en http://localhost:{PORT}")
    try:
        servers[0].serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        for server in servers:
            server.server_close()


if __name__ == "__main__":
    main()
