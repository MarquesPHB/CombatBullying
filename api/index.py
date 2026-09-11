import base64
import hashlib
import hmac
import json
import os
import secrets
from datetime import datetime, timezone
from functools import wraps

import psycopg
from flask import Flask, Response, jsonify, request, send_from_directory
from psycopg.rows import dict_row


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = os.environ.get("DATABASE_URL")
SESSION_SECRET = os.environ.get("SESSION_SECRET", "change-this-session-secret")
SESSION_TTL = 8 * 60 * 60
app = Flask(__name__)


def utc_now():
    return datetime.now(timezone.utc)


def db():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL não configurada.")
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)


def hash_password(password, salt=None):
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120_000)
    return salt.hex() + ":" + digest.hex()


def check_password(password, encoded):
    try:
        salt, digest = encoded.split(":", 1)
        candidate = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), bytes.fromhex(salt), 120_000
        ).hex()
        return hmac.compare_digest(candidate, digest)
    except (ValueError, TypeError):
        return False


def init_database():
    with db() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id BIGSERIAL PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                display_name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'operator',
                password_hash TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL,
                active BOOLEAN NOT NULL DEFAULT TRUE
            );
            CREATE TABLE IF NOT EXISTS protocols (
                id BIGSERIAL PRIMARY KEY,
                protocol_code TEXT NOT NULL UNIQUE,
                privacy TEXT NOT NULL DEFAULT 'anon',
                reporter_name TEXT,
                role TEXT NOT NULL,
                aggression_type TEXT NOT NULL,
                occurred_date TEXT NOT NULL,
                occurred_time TEXT NOT NULL,
                report TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Recebida',
                assigned_to BIGINT REFERENCES users(id),
                created_at TIMESTAMPTZ NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL
            );
            CREATE TABLE IF NOT EXISTS protocol_attachments (
                id BIGSERIAL PRIMARY KEY,
                protocol_id BIGINT NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
                file_name TEXT NOT NULL,
                content_type TEXT NOT NULL,
                file_size BIGINT NOT NULL,
                content BYTEA NOT NULL,
                created_at TIMESTAMPTZ NOT NULL
            );
            """
        )
        admin = connection.execute(
            "SELECT id FROM users WHERE username = 'admin'"
        ).fetchone()
        if admin is None:
            connection.execute(
                """
                INSERT INTO users (username, display_name, role, password_hash, created_at)
                VALUES ('admin', 'Administrador', 'admin', %s, %s)
                """,
                (hash_password("ademin"), utc_now()),
            )


def signed_session(user_id):
    value = f"{user_id}:{int(utc_now().timestamp())}"
    signature = hmac.new(SESSION_SECRET.encode(), value.encode(), hashlib.sha256).hexdigest()
    return f"{value}:{signature}"


def current_user():
    raw = request.cookies.get("combatbullyin_session", "")
    try:
        user_id, issued, signature = raw.split(":", 2)
        value = f"{user_id}:{issued}"
        valid = hmac.compare_digest(
            signature,
            hmac.new(SESSION_SECRET.encode(), value.encode(), hashlib.sha256).hexdigest(),
        )
        if not valid or int(issued) + SESSION_TTL < int(utc_now().timestamp()):
            return None
        with db() as connection:
            return connection.execute(
                "SELECT id, username, display_name, role FROM users WHERE id = %s AND active = TRUE",
                (int(user_id),),
            ).fetchone()
    except (ValueError, TypeError):
        return None


def login_required(handler):
    @wraps(handler)
    def wrapped(*args, **kwargs):
        if current_user() is None:
            return jsonify(error="Faça login para continuar."), 401
        return handler(*args, **kwargs)

    return wrapped


def admin_required(handler):
    @wraps(handler)
    def wrapped(*args, **kwargs):
        user = current_user()
        if user is None:
            return jsonify(error="Faça login para continuar."), 401
        if user["role"] != "admin":
            return jsonify(error="Acesso restrito ao administrador."), 403
        return handler(*args, **kwargs)

    return wrapped


@app.before_request
def prepare_database():
    if DATABASE_URL:
        init_database()


@app.get("/api/me")
def me():
    return jsonify(user=current_user())


@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    with db() as connection:
        user = connection.execute(
            "SELECT * FROM users WHERE username = %s AND active = TRUE",
            (str(data.get("username", "")).strip(),),
        ).fetchone()
    if user is None or not check_password(str(data.get("password", "")), user["password_hash"]):
        return jsonify(error="Usuário ou senha inválidos."), 401
    response = jsonify(message="Login realizado.", user={
        "id": user["id"], "username": user["username"],
        "display_name": user["display_name"], "role": user["role"],
    })
    response.set_cookie(
        "combatbullyin_session", signed_session(user["id"]),
        httponly=True, secure=True, samesite="Strict", max_age=SESSION_TTL,
    )
    return response


@app.post("/api/logout")
def logout():
    response = jsonify(message="Sessão encerrada.")
    response.delete_cookie("combatbullyin_session")
    return response


@app.route("/api/users", methods=["GET"])
@admin_required
def users():
    with db() as connection:
        rows = connection.execute(
            "SELECT id, username, display_name, role, created_at, active FROM users ORDER BY username"
        ).fetchall()
    return jsonify(users=rows)


@app.post("/api/users")
@admin_required
def create_user():
    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    display_name = str(data.get("display_name", "")).strip()
    password = str(data.get("password", ""))
    if not username or not display_name:
        return jsonify(error="Preencha nome e usuário."), 400
    if len(password) < 6:
        return jsonify(error="A senha deve ter pelo menos 6 caracteres."), 400
    try:
        with db() as connection:
            connection.execute(
                """
                INSERT INTO users (username, display_name, password_hash, created_at)
                VALUES (%s, %s, %s, %s)
                """,
                (username, display_name, hash_password(password), utc_now()),
            )
    except psycopg.errors.UniqueViolation:
        return jsonify(error="Este nome de usuário já está em uso."), 409
    return jsonify(message="Usuário criado com sucesso."), 201


@app.get("/api/team")
@login_required
def team():
    with db() as connection:
        rows = connection.execute(
            "SELECT id, display_name, username FROM users WHERE active = TRUE ORDER BY display_name"
        ).fetchall()
    return jsonify(users=rows)


@app.get("/api/protocols")
@login_required
def protocols():
    with db() as connection:
        rows = connection.execute(
            """
            SELECT p.*, u.display_name AS assigned_name
            FROM protocols p LEFT JOIN users u ON u.id = p.assigned_to
            ORDER BY p.created_at DESC
            """
        ).fetchall()
        for protocol in rows:
            protocol["attachments"] = connection.execute(
                """
                SELECT id, file_name, content_type, file_size, created_at
                FROM protocol_attachments WHERE protocol_id = %s ORDER BY id
                """,
                (protocol["id"],),
            ).fetchall()
    return jsonify(protocols=rows)


@app.post("/api/protocols")
def create_protocol():
    data = request.get_json(silent=True) or {}
    required = ("aggression_type", "occurred_date", "occurred_time", "report")
    if any(not str(data.get(field, "")).strip() for field in required):
        return jsonify(error="Informe tipo de agressão, data, hora e relato."), 400
    attachments = data.get("attachments", [])
    if not isinstance(attachments, list) or len(attachments) > 8:
        return jsonify(error="Envie no máximo 8 anexos."), 400
    prepared = []
    total_size = 0
    for item in attachments:
        try:
            content = base64.b64decode(str(item["data"]).split(",", 1)[-1], validate=True)
            name = str(item["name"]).strip()
            content_type = str(item.get("type", "application/octet-stream"))
        except (KeyError, ValueError, TypeError):
            return jsonify(error="Anexo inválido."), 400
        if not name or len(content) > 8_000_000:
            return jsonify(error="Cada anexo deve ter no máximo 8 MB."), 400
        total_size += len(content)
        prepared.append((name, content_type, content))
    if total_size > 20_000_000:
        return jsonify(error="O conjunto de anexos deve ter no máximo 20 MB."), 400
    code = f"#STN-{utc_now().year}-{secrets.randbelow(9000) + 1000}"
    with db() as connection:
        protocol = connection.execute(
            """
            INSERT INTO protocols
              (protocol_code, privacy, reporter_name, role, aggression_type,
               occurred_date, occurred_time, report, created_at, updated_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
            """,
            (
                code, data.get("privacy", "anon"), data.get("reporter_name") or None,
                data.get("role", "victim"), data["aggression_type"], data["occurred_date"],
                data["occurred_time"], data["report"], utc_now(), utc_now(),
            ),
        ).fetchone()["id"]
        for name, content_type, content in prepared:
            connection.execute(
                """
                INSERT INTO protocol_attachments
                  (protocol_id, file_name, content_type, file_size, content, created_at)
                VALUES (%s,%s,%s,%s,%s,%s)
                """,
                (protocol, name, content_type, len(content), content, utc_now()),
            )
    return jsonify(message="Relato recebido.", protocol=code), 201


@app.patch("/api/protocols/<int:protocol_id>")
@login_required
def update_protocol(protocol_id):
    data = request.get_json(silent=True) or {}
    allowed = {"Recebida", "Em triagem", "Em tratativa", "Encaminhada", "Concluída"}
    if data.get("status") not in allowed:
        return jsonify(error="Status inválido."), 400
    assigned = data.get("assigned_to")
    with db() as connection:
        connection.execute(
            "UPDATE protocols SET status=%s, assigned_to=%s, updated_at=%s WHERE id=%s",
            (data["status"], assigned or None, utc_now(), protocol_id),
        )
    return jsonify(message="Protocolo atualizado.")


@app.get("/api/protocols/<int:protocol_id>/attachments/<int:attachment_id>")
@login_required
def download_attachment(protocol_id, attachment_id):
    with db() as connection:
        item = connection.execute(
            """
            SELECT file_name, content_type, content FROM protocol_attachments
            WHERE id=%s AND protocol_id=%s
            """,
            (attachment_id, protocol_id),
        ).fetchone()
    if item is None:
        return jsonify(error="Anexo não encontrado."), 404
    response = Response(bytes(item["content"]), mimetype=item["content_type"])
    safe_name = item["file_name"].replace('"', "").replace("\r", "").replace("\n", "")
    response.headers["Content-Disposition"] = f'attachment; filename="{safe_name}"'
    return response


@app.get("/")
def index():
    return send_from_directory(ROOT, "index.html")


@app.get("/admin")
def admin():
    return send_from_directory(ROOT, "admin.html")


@app.get("/admin.html")
def admin_html():
    return send_from_directory(ROOT, "admin.html")
