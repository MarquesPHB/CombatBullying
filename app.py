import hashlib
import base64
import json
import os
import secrets
import sqlite3
from datetime import datetime, timezone
from http import HTTPStatus
from http.cookies import SimpleCookie
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


ROOT = Path(__file__).resolve().parent
DATABASE = ROOT / "combatbullyin.db"
SESSION_TTL_SECONDS = 8 * 60 * 60
SESSIONS = {}


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def hash_password(password, salt=None):
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120_000)
    return salt.hex() + ":" + digest.hex()


def check_password(password, encoded):
    try:
        salt_hex, digest_hex = encoded.split(":", 1)
        candidate = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), bytes.fromhex(salt_hex), 120_000
        ).hex()
        return secrets.compare_digest(candidate, digest_hex)
    except (ValueError, TypeError):
        return False


def connect():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def init_database():
    with connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE COLLATE NOCASE,
                display_name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'operator',
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL,
                active INTEGER NOT NULL DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS protocols (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                protocol_code TEXT NOT NULL UNIQUE,
                privacy TEXT NOT NULL DEFAULT 'anon',
                reporter_name TEXT,
                role TEXT NOT NULL,
                aggression_type TEXT NOT NULL,
                occurred_date TEXT NOT NULL,
                occurred_time TEXT NOT NULL,
                report TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Recebida',
                assigned_to INTEGER,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (assigned_to) REFERENCES users(id)
            );
            CREATE TABLE IF NOT EXISTS protocol_attachments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                protocol_id INTEGER NOT NULL,
                file_name TEXT NOT NULL,
                content_type TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                content BLOB NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (protocol_id) REFERENCES protocols(id) ON DELETE CASCADE
            );
            """
        )
        admin = connection.execute(
            "SELECT id FROM users WHERE username = 'admin'"
        ).fetchone()
        if admin is None:
            connection.execute(
                """
                INSERT INTO users
                    (username, display_name, role, password_hash, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                ("admin", "Administrador", "admin", hash_password("ademin"), utc_now()),
            )


def json_bytes(payload):
    return json.dumps(payload, ensure_ascii=False).encode("utf-8")


class ApplicationHandler(BaseHTTPRequestHandler):
    server_version = "CombatBullyin/1.0"

    def log_message(self, format_string, *args):
        print("%s - %s" % (self.address_string(), format_string % args))

    def send_json(self, payload, status=HTTPStatus.OK):
        body = json_bytes(payload)
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, message, status):
        self.send_json({"error": message}, status)

    def read_json(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length > 25_000_000:
                raise ValueError("payload too large")
            return json.loads(self.rfile.read(length) or b"{}")
        except (ValueError, json.JSONDecodeError):
            raise ValueError("JSON inválido")

    def current_user(self):
        cookie = SimpleCookie(self.headers.get("Cookie", ""))
        session_id = cookie.get("combatbullyin_session")
        if session_id is None:
            return None
        session = SESSIONS.get(session_id.value)
        if session is None or session["expires"] < datetime.now().timestamp():
            SESSIONS.pop(session_id.value, None)
            return None
        with connect() as connection:
            return connection.execute(
                "SELECT id, username, display_name, role FROM users WHERE id = ? AND active = 1",
                (session["user_id"],),
            ).fetchone()

    def require_admin(self):
        user = self.current_user()
        if user is None:
            self.send_error_json("Faça login para continuar.", HTTPStatus.UNAUTHORIZED)
            return None
        if user["role"] != "admin":
            self.send_error_json("Acesso restrito ao administrador.", HTTPStatus.FORBIDDEN)
            return None
        return user

    def set_session_cookie(self, session_id):
        self.send_header(
            "Set-Cookie",
            f"combatbullyin_session={session_id}; HttpOnly; SameSite=Strict; Path=/; Max-Age={SESSION_TTL_SECONDS}",
        )

    def do_GET(self):
        route = self.path.split("?", 1)[0].rstrip("/") or "/"
        if route == "/api/me":
            user = self.current_user()
            self.send_json({"user": dict(user) if user else None})
            return
        if route == "/api/protocols":
            user = self.current_user()
            if user is None:
                self.send_error_json("Faça login para continuar.", HTTPStatus.UNAUTHORIZED)
                return
            with connect() as connection:
                protocols = connection.execute(
                    """
                    SELECT p.*, u.display_name AS assigned_name
                    FROM protocols p
                    LEFT JOIN users u ON u.id = p.assigned_to
                    ORDER BY p.created_at DESC
                    """
                ).fetchall()
                result = []
                for item in protocols:
                    protocol = dict(item)
                    protocol["attachments"] = [
                        dict(attachment)
                        for attachment in connection.execute(
                            """
                            SELECT id, file_name, content_type, file_size, created_at
                            FROM protocol_attachments WHERE protocol_id = ? ORDER BY id
                            """,
                            (item["id"],),
                        ).fetchall()
                    ]
                    result.append(protocol)
            self.send_json({"protocols": result})
            return
        if route.startswith("/api/protocols/") and "/attachments/" in route:
            user = self.current_user()
            if user is None:
                self.send_error_json("Faça login para continuar.", HTTPStatus.UNAUTHORIZED)
                return
            try:
                attachment_id = int(route.rsplit("/", 1)[1])
            except ValueError:
                self.send_error_json("Anexo inválido.", HTTPStatus.BAD_REQUEST)
                return
            with connect() as connection:
                attachment = connection.execute(
                    "SELECT file_name, content_type, content FROM protocol_attachments WHERE id = ?",
                    (attachment_id,),
                ).fetchone()
            if attachment is None:
                self.send_error_json("Anexo não encontrado.", HTTPStatus.NOT_FOUND)
                return
            content = bytes(attachment["content"])
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", attachment["content_type"])
            safe_name = attachment["file_name"].replace('"', "").replace("\r", "").replace("\n", "")
            self.send_header("Content-Disposition", f'attachment; filename="{safe_name}"')
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(content)
            return
        if route == "/api/team":
            if self.current_user() is None:
                self.send_error_json("Faça login para continuar.", HTTPStatus.UNAUTHORIZED)
                return
            with connect() as connection:
                users = connection.execute(
                    "SELECT id, display_name, username FROM users WHERE active = 1 ORDER BY display_name"
                ).fetchall()
            self.send_json({"users": [dict(item) for item in users]})
            return
        if route == "/api/users":
            if self.require_admin() is None:
                return
            with connect() as connection:
                users = connection.execute(
                    """
                    SELECT id, username, display_name, role, created_at, active
                    FROM users ORDER BY username COLLATE NOCASE
                    """
                ).fetchall()
            self.send_json({"users": [dict(user) for user in users]})
            return
        if route == "/" or route == "/index.html":
            content = (ROOT / "index.html").read_bytes()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return
        if route in ("/admin", "/admin.html"):
            content = (ROOT / "admin.html").read_bytes()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return
        self.send_error_json("Recurso não encontrado.", HTTPStatus.NOT_FOUND)

    def do_POST(self):
        route = urlparse(self.path).path
        try:
            data = self.read_json()
        except ValueError as error:
            self.send_error_json(str(error), HTTPStatus.BAD_REQUEST)
            return

        if route == "/api/login":
            self.login(data)
        elif route == "/api/logout":
            self.logout()
        elif route == "/api/password":
            self.change_password(data)
        elif route == "/api/users":
            self.create_user(data)
        elif route == "/api/protocols":
            self.create_protocol(data)
        else:
            self.send_error_json("Recurso não encontrado.", HTTPStatus.NOT_FOUND)

    def do_DELETE(self):
        route = urlparse(self.path)
        if not route.path.startswith("/api/users/"):
            self.send_error_json("Recurso não encontrado.", HTTPStatus.NOT_FOUND)
            return
        if self.require_admin() is None:
            return
        try:
            user_id = int(route.path.rsplit("/", 1)[1])
        except ValueError:
            self.send_error_json("Usuário inválido.", HTTPStatus.BAD_REQUEST)
            return
        with connect() as connection:
            target = connection.execute(
                "SELECT username, role FROM users WHERE id = ?", (user_id,)
            ).fetchone()
            if target is None:
                self.send_error_json("Usuário não encontrado.", HTTPStatus.NOT_FOUND)
                return
            if target["role"] == "admin":
                self.send_error_json("O administrador não pode ser removido.", HTTPStatus.CONFLICT)
                return
            connection.execute("DELETE FROM users WHERE id = ?", (user_id,))
        self.send_json({"message": "Usuário removido."})

    def do_PATCH(self):
        route = urlparse(self.path)
        if not route.path.startswith("/api/protocols/"):
            self.send_error_json("Recurso não encontrado.", HTTPStatus.NOT_FOUND)
            return
        user = self.current_user()
        if user is None:
            self.send_error_json("Faça login para continuar.", HTTPStatus.UNAUTHORIZED)
            return
        try:
            protocol_id = int(route.path.rsplit("/", 1)[1])
            data = self.read_json()
        except (ValueError, TypeError):
            self.send_error_json("Protocolo inválido.", HTTPStatus.BAD_REQUEST)
            return
        status = str(data.get("status", "")).strip()
        responsible = data.get("assigned_to")
        allowed_statuses = {"Recebida", "Em triagem", "Em tratativa", "Encaminhada", "Concluída"}
        if status not in allowed_statuses:
            self.send_error_json("Status inválido.", HTTPStatus.BAD_REQUEST)
            return
        try:
            assigned_to = int(responsible) if responsible not in (None, "") else None
        except (TypeError, ValueError):
            self.send_error_json("Responsável inválido.", HTTPStatus.BAD_REQUEST)
            return
        with connect() as connection:
            if assigned_to is not None and connection.execute(
                "SELECT id FROM users WHERE id = ? AND active = 1", (assigned_to,)
            ).fetchone() is None:
                self.send_error_json("Responsável não encontrado.", HTTPStatus.BAD_REQUEST)
                return
            updated = connection.execute(
                """
                UPDATE protocols SET status = ?, assigned_to = ?, updated_at = ?
                WHERE id = ?
                """,
                (status, assigned_to, utc_now(), protocol_id),
            ).rowcount
        if not updated:
            self.send_error_json("Protocolo não encontrado.", HTTPStatus.NOT_FOUND)
            return
        self.send_json({"message": "Protocolo atualizado."})

    def login(self, data):
        username = str(data.get("username", "")).strip()
        password = str(data.get("password", ""))
        with connect() as connection:
            user = connection.execute(
                "SELECT * FROM users WHERE username = ? AND active = 1", (username,)
            ).fetchone()
        if user is None or not check_password(password, user["password_hash"]):
            self.send_error_json("Usuário ou senha inválidos.", HTTPStatus.UNAUTHORIZED)
            return
        session_id = secrets.token_urlsafe(32)
        SESSIONS[session_id] = {
            "user_id": user["id"],
            "expires": datetime.now().timestamp() + SESSION_TTL_SECONDS,
        }
        body = json_bytes(
            {
                "message": "Login realizado.",
                "user": {
                    "id": user["id"],
                    "username": user["username"],
                    "display_name": user["display_name"],
                    "role": user["role"],
                },
            }
        )
        self.send_response(HTTPStatus.OK)
        self.set_session_cookie(session_id)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def logout(self):
        cookie = SimpleCookie(self.headers.get("Cookie", ""))
        session_id = cookie.get("combatbullyin_session")
        if session_id:
            SESSIONS.pop(session_id.value, None)
        self.send_json({"message": "Sessão encerrada."})

    def change_password(self, data):
        user = self.current_user()
        if user is None:
            self.send_error_json("Faça login para continuar.", HTTPStatus.UNAUTHORIZED)
            return
        current = str(data.get("current_password", ""))
        new_password = str(data.get("new_password", ""))
        if len(new_password) < 6:
            self.send_error_json("A nova senha deve ter pelo menos 6 caracteres.", HTTPStatus.BAD_REQUEST)
            return
        with connect() as connection:
            stored = connection.execute(
                "SELECT password_hash FROM users WHERE id = ?", (user["id"],)
            ).fetchone()
            if stored is None or not check_password(current, stored["password_hash"]):
                self.send_error_json("A senha atual está incorreta.", HTTPStatus.UNAUTHORIZED)
                return
            connection.execute(
                "UPDATE users SET password_hash = ? WHERE id = ?",
                (hash_password(new_password), user["id"]),
            )
        self.send_json({"message": "Senha alterada com sucesso."})

    def create_user(self, data):
        if self.require_admin() is None:
            return
        username = str(data.get("username", "")).strip()
        display_name = str(data.get("display_name", "")).strip()
        password = str(data.get("password", ""))
        if not username or not display_name:
            self.send_error_json("Preencha nome e usuário.", HTTPStatus.BAD_REQUEST)
            return
        if len(password) < 6:
            self.send_error_json("A senha deve ter pelo menos 6 caracteres.", HTTPStatus.BAD_REQUEST)
            return
        if not all(character.isalnum() or character in "._-" for character in username):
            self.send_error_json("O usuário deve conter apenas letras, números, ponto, hífen ou sublinhado.", HTTPStatus.BAD_REQUEST)
            return
        try:
            with connect() as connection:
                connection.execute(
                    """
                    INSERT INTO users (username, display_name, role, password_hash, created_at)
                    VALUES (?, ?, 'operator', ?, ?)
                    """,
                    (username, display_name, hash_password(password), utc_now()),
                )
        except sqlite3.IntegrityError:
            self.send_error_json("Este nome de usuário já está em uso.", HTTPStatus.CONFLICT)
            return
        self.send_json({"message": "Usuário criado com sucesso."}, HTTPStatus.CREATED)

    def create_protocol(self, data):
        aggression_type = str(data.get("aggression_type", "")).strip()
        occurred_date = str(data.get("occurred_date", "")).strip()
        occurred_time = str(data.get("occurred_time", "")).strip()
        report = str(data.get("report", "")).strip()
        privacy = str(data.get("privacy", "anon")).strip()
        reporter_name = str(data.get("reporter_name", "")).strip() or None
        role = str(data.get("role", "victim")).strip()
        attachments = data.get("attachments", [])
        if not aggression_type or not occurred_date or not occurred_time or not report:
            self.send_error_json("Informe tipo de agressão, data, hora e relato.", HTTPStatus.BAD_REQUEST)
            return
        if len(report) > 1500:
            self.send_error_json("O relato deve ter no máximo 1500 caracteres.", HTTPStatus.BAD_REQUEST)
            return
        if not isinstance(attachments, list) or len(attachments) > 8:
            self.send_error_json("Envie no máximo 8 anexos.", HTTPStatus.BAD_REQUEST)
            return
        prepared_attachments = []
        total_size = 0
        for item in attachments:
            if not isinstance(item, dict):
                self.send_error_json("Formato de anexo inválido.", HTTPStatus.BAD_REQUEST)
                return
            file_name = str(item.get("name", "")).strip()
            content_type = str(item.get("type", "application/octet-stream")).strip()
            encoded = str(item.get("data", "")).split(",", 1)[-1]
            if not file_name or not encoded:
                self.send_error_json("Nome e conteúdo do anexo são obrigatórios.", HTTPStatus.BAD_REQUEST)
                return
            try:
                content = base64.b64decode(encoded, validate=True)
            except (ValueError, TypeError):
                self.send_error_json("Conteúdo de anexo inválido.", HTTPStatus.BAD_REQUEST)
                return
            if len(content) > 8_000_000:
                self.send_error_json("Cada anexo deve ter no máximo 8 MB.", HTTPStatus.BAD_REQUEST)
                return
            total_size += len(content)
            if total_size > 20_000_000:
                self.send_error_json("O conjunto de anexos deve ter no máximo 20 MB.", HTTPStatus.BAD_REQUEST)
                return
            prepared_attachments.append((file_name, content_type, content))
        code = f"#STN-{datetime.now().year}-{secrets.randbelow(9000) + 1000}"
        with connect() as connection:
            protocol = connection.execute(
                """
                INSERT INTO protocols
                    (protocol_code, privacy, reporter_name, role, aggression_type,
                     occurred_date, occurred_time, report, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (code, privacy, reporter_name, role, aggression_type, occurred_date,
                 occurred_time, report, utc_now(), utc_now()),
            ).lastrowid
            for file_name, content_type, content in prepared_attachments:
                connection.execute(
                    """
                    INSERT INTO protocol_attachments
                        (protocol_id, file_name, content_type, file_size, content, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (protocol, file_name, content_type, len(content), content, utc_now()),
                )
        self.send_json({"message": "Relato recebido.", "protocol": code}, HTTPStatus.CREATED)


if __name__ == "__main__":
    init_database()
    host = os.environ.get("COMBATBULLYIN_HOST", "0.0.0.0")
    port = int(os.environ.get("COMBATBULLYIN_PORT", "8000"))
    server = ThreadingHTTPServer((host, port), ApplicationHandler)
    print(f"CombatBullyin disponível na porta {port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
    finally:
        server.server_close()
