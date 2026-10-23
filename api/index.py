import base64
import hashlib
import hmac
import json
import os
import re
import secrets
from datetime import datetime, timezone
from functools import wraps
from urllib.parse import urlparse

import psycopg
from flask import Flask, Response, jsonify, redirect, request, send_from_directory
from psycopg.rows import dict_row


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = os.environ.get("DATABASE_URL")
SESSION_SECRET = os.environ.get("SESSION_SECRET", "")
INITIAL_ADMIN_PASSWORD = os.environ.get("INITIAL_ADMIN_PASSWORD", "")
BLOB_READ_WRITE_TOKEN = os.environ.get("BLOB_READ_WRITE_TOKEN", "")
SESSION_TTL = 8 * 60 * 60
MAX_ATTACHMENTS_SIZE = 2_000_000_000
ATTACHMENT_LIMITS = {
    "video/mp4": 1_000_000_000,
    "video/webm": 1_000_000_000,
    "video/quicktime": 1_000_000_000,
    "video/x-matroska": 1_000_000_000,
    "video/3gpp": 1_000_000_000,
    "video/x-msvideo": 1_000_000_000,
    "video/mpeg": 1_000_000_000,
    "audio/mpeg": 100_000_000,
    "audio/mp4": 100_000_000,
    "audio/ogg": 100_000_000,
    "audio/wav": 100_000_000,
    "audio/x-wav": 100_000_000,
    "audio/webm": 100_000_000,
    "audio/aac": 100_000_000,
    "audio/flac": 100_000_000,
    "audio/x-m4a": 100_000_000,
    "audio/3gpp": 100_000_000,
    "audio/midi": 100_000_000,
    "audio/x-ms-wma": 100_000_000,
    "image/jpeg": 50_000_000,
    "image/png": 50_000_000,
    "image/webp": 50_000_000,
    "image/gif": 50_000_000,
    "image/heic": 50_000_000,
    "image/heif": 50_000_000,
    "image/avif": 50_000_000,
    "image/bmp": 50_000_000,
    "image/tiff": 50_000_000,
    "application/pdf": 25_000_000,
    "application/msword": 25_000_000,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 25_000_000,
    "application/rtf": 25_000_000,
    "text/plain": 25_000_000,
    "text/csv": 25_000_000,
    "text/rtf": 25_000_000,
}
app = Flask(__name__)


@app.errorhandler(Exception)
def handle_unexpected_error(error):
    app.logger.exception("Erro inesperado no backend", exc_info=error)
    return jsonify(error="Não foi possível processar a solicitação. Verifique a configuração do banco de dados no Vercel."), 500


@app.errorhandler(500)
def handle_internal_error(error):
    return jsonify(error="Erro interno do servidor. Verifique a configuração do banco de dados no Vercel."), 500


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
                pin_hash TEXT,
                privacy TEXT NOT NULL DEFAULT 'anon',
                reporter_name TEXT,
                role TEXT NOT NULL,
                aggression_type TEXT NOT NULL,
                occurred_date TEXT NOT NULL,
                occurred_time TEXT NOT NULL,
                location TEXT NOT NULL DEFAULT '',
                class_series TEXT NOT NULL DEFAULT '',
                report TEXT NOT NULL,
                reporter_email TEXT,
                reporter_phone TEXT,
                status TEXT NOT NULL DEFAULT 'Recebida',
                assigned_to BIGINT REFERENCES users(id),
                treatment_notes TEXT NOT NULL DEFAULT '',
                created_at TIMESTAMPTZ NOT NULL,
                updated_at TIMESTAMPTZ NOT NULL
            );
            CREATE TABLE IF NOT EXISTS protocol_attachments (
                id BIGSERIAL PRIMARY KEY,
                protocol_id BIGINT NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
                file_name TEXT NOT NULL,
                content_type TEXT NOT NULL,
                file_size BIGINT NOT NULL,
                content BYTEA,
                blob_pathname TEXT,
                blob_url TEXT,
                upload_status TEXT NOT NULL DEFAULT 'complete',
                created_at TIMESTAMPTZ NOT NULL
            );
            CREATE TABLE IF NOT EXISTS protocol_treatment_steps (
                id BIGSERIAL PRIMARY KEY,
                protocol_id BIGINT NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
                user_id BIGINT REFERENCES users(id),
                status TEXT NOT NULL,
                assigned_to BIGINT REFERENCES users(id),
                notes TEXT NOT NULL DEFAULT '',
                created_at TIMESTAMPTZ NOT NULL
            );
            CREATE TABLE IF NOT EXISTS guide_items (
                id BIGSERIAL PRIMARY KEY,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                details TEXT NOT NULL DEFAULT '',
                source_url TEXT,
                icon TEXT NOT NULL DEFAULT 'menu_book',
                created_at TIMESTAMPTZ NOT NULL
            );
            CREATE TABLE IF NOT EXISTS protocol_notifications (
                id BIGSERIAL PRIMARY KEY,
                protocol_id BIGINT NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
                channel TEXT NOT NULL,
                recipient TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL
            );
            """
        )
        connection.execute(
            "ALTER TABLE protocols ADD COLUMN IF NOT EXISTS treatment_notes TEXT NOT NULL DEFAULT ''"
        )
        connection.execute("ALTER TABLE protocols ADD COLUMN IF NOT EXISTS pin_hash TEXT")
        connection.execute("ALTER TABLE guide_items ADD COLUMN IF NOT EXISTS details TEXT NOT NULL DEFAULT ''")
        connection.execute("ALTER TABLE guide_items ADD COLUMN IF NOT EXISTS source_url TEXT")
        connection.execute("ALTER TABLE protocols ADD COLUMN IF NOT EXISTS reporter_email TEXT")
        connection.execute("ALTER TABLE protocols ADD COLUMN IF NOT EXISTS reporter_phone TEXT")
        connection.execute("ALTER TABLE protocols ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT ''")
        connection.execute("ALTER TABLE protocols ADD COLUMN IF NOT EXISTS class_series TEXT NOT NULL DEFAULT ''")
        connection.execute("ALTER TABLE protocol_attachments ALTER COLUMN content DROP NOT NULL")
        connection.execute("ALTER TABLE protocol_attachments ADD COLUMN IF NOT EXISTS blob_pathname TEXT")
        connection.execute("ALTER TABLE protocol_attachments ADD COLUMN IF NOT EXISTS blob_url TEXT")
        connection.execute(
            "ALTER TABLE protocol_attachments ADD COLUMN IF NOT EXISTS upload_status TEXT NOT NULL DEFAULT 'complete'"
        )
        guide_count = connection.execute("SELECT COUNT(*) AS count FROM guide_items").fetchone()["count"]
        if guide_count == 0:
            for item in [
                ("Prevenção", "Como reconhecer o bullying?", "Entenda os sinais e como agir com segurança.", "Bullying envolve violência física ou psicológica intencional e repetitiva em uma relação de desequilíbrio de poder. Ao perceber uma situação, preserve evidências, procure um adulto de confiança e use os canais da escola.", "shield", "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13185.htm"),
                ("Direitos", "Seus direitos na escola", "Conheça responsabilidades e caminhos para pedir ajuda.", "A Lei nº 13.185/2015 institui o Programa de Combate à Intimidação Sistemática (Bullying) e orienta ações de prevenção, conscientização e combate à violência.", "gavel", "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13185.htm"),
                ("Canais de apoio", "Onde buscar ajuda", "Converse com adultos de confiança e procure os canais da sua região.", "Em risco imediato, procure um adulto de confiança e os serviços de emergência. Para violações de direitos humanos, o Disque 100 é um canal oficial; para situações de violência contra a mulher, o Ligue 180 oferece orientação. A SaferNet mantém orientação para violações na Internet.", "support_agent", "https://new.safernet.org.br/helpline"),
            ]:
                connection.execute(
                    """
                    INSERT INTO guide_items (category, title, description, details, icon, source_url, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    (item[0], item[1], item[2], item[3], item[4], item[5], utc_now()),
                )
        connection.execute(
            """
            UPDATE guide_items
            SET details = CASE title
                WHEN 'Como reconhecer o bullying?' THEN 'Bullying envolve violência física ou psicológica intencional e repetitiva em uma relação de desequilíbrio de poder. Ao perceber uma situação, preserve evidências, procure um adulto de confiança e use os canais da escola.'
                WHEN 'Seus direitos na escola' THEN 'A Lei nº 13.185/2015 institui o Programa de Combate à Intimidação Sistemática (Bullying) e orienta ações de prevenção, conscientização e combate à violência.'
                WHEN 'Onde buscar ajuda' THEN 'Em risco imediato, procure um adulto de confiança e os serviços de emergência. Para violações de direitos humanos, o Disque 100 é um canal oficial; para situações de violência contra a mulher, o Ligue 180 oferece orientação. A SaferNet mantém orientação para violações na Internet.'
                ELSE details END,
                source_url = CASE title
                WHEN 'Como reconhecer o bullying?' THEN 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13185.htm'
                WHEN 'Seus direitos na escola' THEN 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13185.htm'
                WHEN 'Onde buscar ajuda' THEN 'https://new.safernet.org.br/helpline'
                ELSE source_url END
            WHERE title IN ('Como reconhecer o bullying?', 'Seus direitos na escola', 'Onde buscar ajuda')
            """
        )
        admin = connection.execute(
            "SELECT id, password_hash FROM users WHERE username = 'admin'"
        ).fetchone()
        if admin is None:
            if len(INITIAL_ADMIN_PASSWORD) >= 20:
                connection.execute(
                    """
                    INSERT INTO users (username, display_name, role, password_hash, created_at)
                    VALUES ('admin', 'Administrador', 'admin', %s, %s)
                    """,
                    (hash_password(INITIAL_ADMIN_PASSWORD), utc_now()),
                )
        elif len(INITIAL_ADMIN_PASSWORD) >= 20 and not check_password(
            INITIAL_ADMIN_PASSWORD, admin["password_hash"]
        ):
            connection.execute(
                "UPDATE users SET password_hash = %s WHERE id = %s",
                (hash_password(INITIAL_ADMIN_PASSWORD), admin["id"]),
            )


def signed_session(user_id):
    if len(SESSION_SECRET) < 32:
        raise RuntimeError("SESSION_SECRET deve conter pelo menos 32 caracteres.")
    value = f"{user_id}:{int(utc_now().timestamp())}"
    signature = hmac.new(SESSION_SECRET.encode(), value.encode(), hashlib.sha256).hexdigest()
    return f"{value}:{signature}"


def current_user():
    if len(SESSION_SECRET) < 32:
        return None
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


def can_access_protocol(connection, protocol_id, user):
    if user["role"] == "admin":
        return True
    return connection.execute(
        "SELECT 1 FROM protocols WHERE id = %s AND assigned_to = %s",
        (protocol_id, user["id"]),
    ).fetchone() is not None


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
    if len(SESSION_SECRET) < 32:
        return jsonify(error="A autenticação segura não está configurada no servidor."), 503
    data = request.get_json(silent=True) or {}
    with db() as connection:
        user = connection.execute(
            "SELECT * FROM users WHERE username = %s AND active = TRUE",
            (str(data.get("username", "")).strip(),),
        ).fetchone()
    password = str(data.get("password", ""))
    if (
        user is None
        or (user["username"] == "admin" and password == "ademin")
        or not check_password(password, user["password_hash"])
    ):
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


@app.post("/api/users/<int:user_id>/reset-password")
@admin_required
def reset_user_password(user_id):
    data = request.get_json(silent=True) or {}
    password = str(data.get("password", ""))
    if len(password) < 6:
        return jsonify(error="A senha deve ter pelo menos 6 caracteres."), 400
    with db() as connection:
        updated = connection.execute(
            """
            UPDATE users SET password_hash = %s
            WHERE id = %s AND active = TRUE
            RETURNING id
            """,
            (hash_password(password), user_id),
        ).fetchone()
    if updated is None:
        return jsonify(error="Usuário não encontrado."), 404
    return jsonify(message="Senha redefinida com sucesso.")


@app.get("/api/team")
@login_required
def team():
    with db() as connection:
        rows = connection.execute(
            "SELECT id, display_name, username FROM users WHERE active = TRUE ORDER BY display_name"
        ).fetchall()
    return jsonify(users=rows)


@app.get("/api/guides")
def guides():
    with db() as connection:
        rows = connection.execute(
            "SELECT id, category, title, description, details, source_url, icon FROM guide_items ORDER BY id"
        ).fetchall()
    return jsonify(items=rows)


@app.post("/api/guides")
@admin_required
def create_guide():
    data = request.get_json(silent=True) or {}
    category = str(data.get("category", "")).strip()
    title = str(data.get("title", "")).strip()
    description = str(data.get("description", "")).strip()
    details = str(data.get("details", "")).strip()
    source_url = str(data.get("source_url", "")).strip() or None
    icon = str(data.get("icon", "menu_book")).strip() or "menu_book"
    if not category or not title or not description:
        return jsonify(error="Preencha categoria, título e conteúdo."), 400
    with db() as connection:
        item = connection.execute(
            """
            INSERT INTO guide_items (category, title, description, details, source_url, icon, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id
            """,
            (category, title, description, details or description, source_url, icon, utc_now()),
        ).fetchone()
    return jsonify(message="Informação adicionada.", id=item["id"]), 201


@app.delete("/api/guides/<int:item_id>")
@admin_required
def delete_guide(item_id):
    with db() as connection:
        deleted = connection.execute(
            "DELETE FROM guide_items WHERE id = %s RETURNING id", (item_id,)
        ).fetchone()
    if deleted is None:
        return jsonify(error="Informação não encontrada."), 404
    return jsonify(message="Informação excluída.")


@app.get("/api/protocols")
@login_required
def protocols():
    user = current_user()
    with db() as connection:
        if user["role"] == "admin":
            rows = connection.execute(
                """
                SELECT p.*, u.display_name AS assigned_name
                FROM protocols p LEFT JOIN users u ON u.id = p.assigned_to
                ORDER BY p.created_at DESC
                """
            ).fetchall()
        else:
            rows = connection.execute(
                """
                SELECT p.*, u.display_name AS assigned_name
                FROM protocols p LEFT JOIN users u ON u.id = p.assigned_to
                WHERE p.assigned_to = %s
                ORDER BY p.created_at DESC
                """,
                (user["id"],),
            ).fetchall()
        for protocol in rows:
            protocol["notification_count"] = connection.execute(
                "SELECT COUNT(*) AS count FROM protocol_notifications WHERE protocol_id = %s",
                (protocol["id"],),
            ).fetchone()["count"]
        for protocol in rows:
            protocol["attachments"] = connection.execute(
                """
                SELECT id, file_name, content_type, file_size, created_at
                FROM protocol_attachments
                WHERE protocol_id = %s AND upload_status = 'complete'
                ORDER BY id
                """,
                (protocol["id"],),
            ).fetchall()
        for protocol in rows:
            protocol.pop("pin_hash", None)
    return jsonify(protocols=rows)


@app.get("/api/my-protocols")
@login_required
def my_protocols():
    user = current_user()
    with db() as connection:
        rows = connection.execute(
            """
            SELECT p.*, u.display_name AS assigned_name
            FROM protocols p LEFT JOIN users u ON u.id = p.assigned_to
            WHERE p.assigned_to = %s
            ORDER BY p.updated_at DESC
            """,
            (user["id"],),
        ).fetchall()
        for protocol in rows:
            protocol["treatment_steps"] = connection.execute(
                """
                SELECT s.status, s.notes, s.created_at,
                       actor.display_name AS actor_name,
                       assignee.display_name AS assigned_name
                FROM protocol_treatment_steps s
                LEFT JOIN users actor ON actor.id = s.user_id
                LEFT JOIN users assignee ON assignee.id = s.assigned_to
                WHERE s.protocol_id = %s ORDER BY s.created_at DESC
                """,
                (protocol["id"],),
            ).fetchall()
            protocol["attachments"] = connection.execute(
                """
                SELECT id, file_name, content_type, file_size, created_at
                FROM protocol_attachments
                WHERE protocol_id = %s AND upload_status = 'complete'
                ORDER BY id
                """,
                (protocol["id"],),
            ).fetchall()
        for protocol in rows:
            protocol.pop("pin_hash", None)
    return jsonify(protocols=rows)


@app.post("/api/protocols/track")
def track_protocol():
    data = request.get_json(silent=True) or {}
    code = str(data.get("code", "")).strip()
    pin = str(data.get("pin", "")).strip()
    if not code or not pin:
        return jsonify(error="Informe o protocolo e o PIN."), 400
    if not pin.isdigit() or len(pin) != 8:
        return jsonify(error="Protocolo ou PIN incorreto."), 401
    with db() as connection:
        protocol = connection.execute(
            """
            SELECT protocol_code, aggression_type, occurred_date, occurred_time,
                   status, created_at, updated_at, pin_hash
            FROM protocols
            WHERE protocol_code = %s
            """,
            (code,),
        ).fetchone()
    if protocol is None or not protocol["pin_hash"] or not check_password(pin, protocol["pin_hash"]):
        return jsonify(error="Protocolo ou PIN incorreto."), 401
    protocol.pop("pin_hash", None)
    return jsonify(protocol=protocol)


@app.post("/api/protocols")
def create_protocol():
    if not DATABASE_URL:
        return jsonify(error="O banco de dados ainda não está configurado no Vercel. Defina DATABASE_URL e publique novamente."), 503
    data = request.get_json(silent=True) or {}
    required = ("aggression_type", "occurred_date", "occurred_time", "report")
    if any(not str(data.get(field, "")).strip() for field in required):
        return jsonify(error="Informe tipo de agressão, data, hora e relato."), 400
    attachments = data.get("attachments", [])
    privacy = data.get("privacy", "anon")
    reporter_email = str(data.get("reporter_email", "")).strip().lower() or None
    reporter_phone = str(data.get("reporter_phone", "")).strip() or None
    if privacy == "identified" and not reporter_email and not reporter_phone:
        return jsonify(error="Informe e-mail ou telefone/WhatsApp para contato."), 400
    if reporter_email and ("@" not in reporter_email or len(reporter_email) > 254):
        return jsonify(error="Informe um e-mail válido."), 400
    if reporter_phone and len(reporter_phone) > 30:
        return jsonify(error="Informe um telefone/WhatsApp válido."), 400
    if not isinstance(attachments, list) or len(attachments) > 8:
        return jsonify(error="Envie no máximo 8 anexos."), 400
    prepared = []
    total_size = 0
    for item in attachments:
        try:
            encoded = str(item["data"]).split(",", 1)[-1]
            encoded = "".join(encoded.split())
            if not encoded:
                raise ValueError("Anexo vazio.")
            encoded += "=" * (-len(encoded) % 4)
            content = base64.b64decode(encoded, validate=True)
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
    code = f"#STN-{utc_now().year}-{secrets.randbelow(10**12):012d}"
    pin = f"{secrets.randbelow(10**8):08d}"
    pin_hash = hash_password(pin)
    with db() as connection:
        protocol = connection.execute(
            """
            INSERT INTO protocols
              (protocol_code, pin_hash, privacy, reporter_name, reporter_email, reporter_phone,
               role, aggression_type, occurred_date, occurred_time, location, class_series,
               report, created_at, updated_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
            """,
            (
                code, pin_hash, privacy, data.get("reporter_name") or None, reporter_email, reporter_phone,
                data.get("role", "victim"), data["aggression_type"], data["occurred_date"],
                data["occurred_time"], str(data.get("location", "")).strip(),
                str(data.get("class_series", "")).strip(), data["report"], utc_now(), utc_now(),
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
    return jsonify(message="Relato recebido.", protocol=code, pin=pin), 201


@app.post("/api/attachments/reserve")
def reserve_attachment():
    data = request.get_json(silent=True) or {}
    code = str(data.get("code", "")).strip()
    pin = str(data.get("pin", "")).strip()
    file_name = str(data.get("file_name", "")).strip()
    content_type = str(data.get("content_type", "")).strip().lower()
    pathname = str(data.get("pathname", "")).strip()
    try:
        file_size = int(data.get("file_size", 0))
    except (TypeError, ValueError):
        file_size = 0
    file_limit = ATTACHMENT_LIMITS.get(content_type)
    if not code or not pin or not file_name or not pathname:
        return jsonify(error="Não foi possível autorizar este anexo."), 400
    if not pin.isdigit() or len(pin) != 8:
        return jsonify(error="Protocolo ou PIN incorreto."), 401
    if file_limit is None:
        return jsonify(error="Este formato de arquivo não é aceito."), 415
    if file_size < 1 or file_size > file_limit:
        return jsonify(error=f"Este arquivo excede o limite de {file_limit // 1_000_000} MB para o formato selecionado."), 413
    if (
        len(file_name) > 255
        or "/" in file_name
        or "\\" in file_name
        or any(ord(character) < 32 for character in file_name)
    ):
        return jsonify(error="O nome do arquivo é inválido."), 400

    with db() as connection:
        protocol = connection.execute(
            """
            SELECT id, protocol_code, pin_hash FROM protocols
            WHERE protocol_code = %s FOR UPDATE
            """,
            (code,),
        ).fetchone()
        if protocol is None or not protocol["pin_hash"] or not check_password(pin, protocol["pin_hash"]):
            return jsonify(error="Protocolo ou PIN incorreto."), 401
        safe_code = re.sub(r"[^A-Za-z0-9_-]", "", protocol["protocol_code"])
        path_prefix = f"evidence/{safe_code}/"
        path_file = pathname[len(path_prefix):] if pathname.startswith(path_prefix) else ""
        if (
            not path_file
            or "/" in path_file
            or "\\" in pathname
            or ".." in pathname
            or len(pathname) > 1024
        ):
            return jsonify(error="Caminho do anexo inválido."), 400
        connection.execute(
            """
            UPDATE protocol_attachments
            SET upload_status = 'expired'
            WHERE protocol_id = %s AND upload_status = 'pending'
              AND created_at < NOW() - INTERVAL '2 hours'
            """,
            (protocol["id"],),
        )
        active_count = connection.execute(
            """
            SELECT COUNT(*) AS count FROM protocol_attachments
            WHERE protocol_id = %s
              AND (upload_status = 'complete'
                   OR (upload_status = 'pending'
                       AND created_at >= NOW() - INTERVAL '2 hours'))
            """,
            (protocol["id"],),
        ).fetchone()["count"]
        if active_count >= 8:
            return jsonify(error="Este protocolo já possui o limite de 8 anexos."), 400
        reserved_size = int(connection.execute(
            """
            SELECT COALESCE(SUM(file_size), 0) AS total
            FROM protocol_attachments
            WHERE protocol_id = %s
              AND (upload_status = 'complete'
                   OR (upload_status = 'pending'
                       AND created_at >= NOW() - INTERVAL '2 hours'))
            """,
            (protocol["id"],),
        ).fetchone()["total"])
        remaining_size = MAX_ATTACHMENTS_SIZE - reserved_size
        if file_size > remaining_size:
            return jsonify(error="O conjunto de anexos deste protocolo pode ter no máximo 2 GB."), 413
        max_size = min(file_limit, remaining_size)
        attachment = connection.execute(
            """
            INSERT INTO protocol_attachments
              (protocol_id, file_name, content_type, file_size, blob_pathname,
               upload_status, created_at)
            VALUES (%s, %s, %s, %s, %s, 'pending', %s)
            RETURNING id
            """,
            (protocol["id"], file_name, content_type, max_size, pathname, utc_now()),
        ).fetchone()
    return jsonify(
        attachment_id=attachment["id"],
        max_size=max_size,
        content_type=content_type,
    ), 201


@app.post("/api/attachments/complete")
def complete_attachment_upload():
    internal_token = request.headers.get("X-Blob-Internal-Token", "")
    if not BLOB_READ_WRITE_TOKEN or not hmac.compare_digest(internal_token, BLOB_READ_WRITE_TOKEN):
        return jsonify(error="Acesso interno não autorizado."), 401
    data = request.get_json(silent=True) or {}
    try:
        attachment_id = int(data.get("attachment_id", 0))
    except (TypeError, ValueError):
        attachment_id = 0
    pathname = str(data.get("pathname", "")).strip()
    blob_url = str(data.get("url", "")).strip()
    content_type = str(data.get("content_type", "")).strip().lower()
    try:
        file_size = int(data.get("file_size", 0))
    except (TypeError, ValueError):
        file_size = 0
    parsed_url = urlparse(blob_url)
    if (
        not attachment_id
        or not pathname
        or not blob_url.startswith("https://")
        or not parsed_url.hostname
        or not parsed_url.hostname.endswith(".private.blob.vercel-storage.com")
        or content_type not in ATTACHMENT_LIMITS
        or file_size < 1
        or file_size > ATTACHMENT_LIMITS[content_type]
    ):
        return jsonify(error="Os dados de confirmação do anexo são inválidos."), 400
    with db() as connection:
        attachment = connection.execute(
            """
            UPDATE protocol_attachments
            SET blob_url = %s, content_type = %s, file_size = %s,
                upload_status = 'complete'
            WHERE id = %s AND blob_pathname = %s AND upload_status = 'pending'
              AND file_size >= %s
            RETURNING id
            """,
            (blob_url, content_type, file_size, attachment_id, pathname, file_size),
        ).fetchone()
    if attachment is None:
        return jsonify(error="A reserva do anexo não foi encontrada."), 404
    return jsonify(message="Anexo associado ao protocolo.")


@app.post("/api/attachments/cancel")
def cancel_attachment_upload():
    data = request.get_json(silent=True) or {}
    code = str(data.get("code", "")).strip()
    pin = str(data.get("pin", "")).strip()
    pathname = str(data.get("pathname", "")).strip()
    with db() as connection:
        protocol = connection.execute(
            "SELECT id, pin_hash FROM protocols WHERE protocol_code = %s",
            (code,),
        ).fetchone()
        if protocol is None or not protocol["pin_hash"] or not check_password(pin, protocol["pin_hash"]):
            return jsonify(error="Protocolo ou PIN incorreto."), 401
        connection.execute(
            """
            UPDATE protocol_attachments SET upload_status = 'failed'
            WHERE protocol_id = %s AND blob_pathname = %s AND upload_status = 'pending'
            """,
            (protocol["id"], pathname),
        )
    return jsonify(message="Reserva de anexo cancelada.")


@app.get("/api/attachments/authorize-download/<int:attachment_id>")
@login_required
def authorize_attachment_download(attachment_id):
    user = current_user()
    with db() as connection:
        attachment = connection.execute(
            """
            SELECT id, protocol_id, file_name, content_type, file_size,
                   blob_pathname, upload_status
            FROM protocol_attachments WHERE id = %s
            """,
            (attachment_id,),
        ).fetchone()
        if (
            attachment is None
            or attachment["upload_status"] != "complete"
            or not can_access_protocol(connection, attachment["protocol_id"], user)
        ):
            return jsonify(error="Anexo não encontrado."), 404
    return jsonify(attachment=attachment)


@app.patch("/api/protocols/<int:protocol_id>")
@login_required
def update_protocol(protocol_id):
    data = request.get_json(silent=True) or {}
    allowed = {"Recebida", "Em triagem", "Em tratativa", "Encaminhada", "Concluída"}
    status = data.get("status")
    if status is not None and status not in allowed:
        return jsonify(error="Status inválido."), 400
    assignment_changed = "assigned_to" in data
    assigned = data.get("assigned_to") if assignment_changed else None
    notes = data.get("treatment_notes")
    user = current_user()
    with db() as connection:
        existing = connection.execute(
            "SELECT assigned_to FROM protocols WHERE id = %s", (protocol_id,)
        ).fetchone()
        if existing is None:
            return jsonify(error="Protocolo não encontrado."), 404
        if assignment_changed and user["role"] != "admin":
            return jsonify(error="Somente o administrador pode encaminhar protocolos."), 403
        if user["role"] != "admin" and existing["assigned_to"] != user["id"]:
            return jsonify(error="Você só pode atualizar protocolos encaminhados a você."), 403
        if assignment_changed and assigned is not None:
            assignee = connection.execute(
                "SELECT id FROM users WHERE id = %s AND active = TRUE",
                (assigned,),
            ).fetchone()
            if assignee is None:
                return jsonify(error="Responsável inválido ou inativo."), 400
        connection.execute(
            """
            UPDATE protocols
            SET status=COALESCE(%s, status),
                assigned_to=CASE WHEN %s THEN %s ELSE assigned_to END,
                treatment_notes=COALESCE(%s, treatment_notes),
                updated_at=%s
            WHERE id=%s
            """,
            (status, assignment_changed, assigned, notes, utc_now(), protocol_id),
        )
        current = connection.execute(
            "SELECT status, assigned_to FROM protocols WHERE id = %s",
            (protocol_id,),
        ).fetchone()
        if status is not None or assignment_changed or notes is not None:
            connection.execute(
                """
                INSERT INTO protocol_treatment_steps
                  (protocol_id, user_id, status, assigned_to, notes, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    protocol_id, user["id"], current["status"], current["assigned_to"],
                    notes or "", utc_now(),
                ),
            )
            recipients = []
            contact = connection.execute(
                "SELECT reporter_email, reporter_phone, protocol_code FROM protocols WHERE id = %s",
                (protocol_id,),
            ).fetchone()
            if contact["reporter_email"]:
                recipients.append(("email", contact["reporter_email"]))
            if contact["reporter_phone"]:
                recipients.append(("whatsapp", contact["reporter_phone"]))
            message = f"O protocolo {contact['protocol_code']} foi atualizado para: {current['status']}."
            for channel, recipient in recipients:
                connection.execute(
                    """
                    INSERT INTO protocol_notifications
                      (protocol_id, channel, recipient, message, created_at)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (protocol_id, channel, recipient, message, utc_now()),
                )
    return jsonify(message="Protocolo atualizado.")


@app.get("/api/protocols/<int:protocol_id>/attachments/<int:attachment_id>")
@login_required
def download_attachment(protocol_id, attachment_id):
    user = current_user()
    with db() as connection:
        item = connection.execute(
            """
            SELECT a.file_name, a.content_type, a.content, a.blob_pathname,
                   a.upload_status
            FROM protocol_attachments a
            WHERE a.id = %s AND a.protocol_id = %s
            """,
            (attachment_id, protocol_id),
        ).fetchone()
        if (
            item is None
            or item["upload_status"] != "complete"
            or not can_access_protocol(connection, protocol_id, user)
        ):
            return jsonify(error="Anexo não encontrado."), 404
    if item["blob_pathname"]:
        return redirect(f"/api/attachments/download?id={attachment_id}")
    response = Response(bytes(item["content"]), mimetype=item["content_type"])
    safe_name = item["file_name"].replace('"', "").replace("\r", "").replace("\n", "")
    response.headers["Content-Disposition"] = f'attachment; filename="{safe_name}"'
    return response


@app.get("/api/protocols/<int:protocol_id>/notifications")
@login_required
def protocol_notifications(protocol_id):
    user = current_user()
    with db() as connection:
        if not can_access_protocol(connection, protocol_id, user):
            return jsonify(error="Protocolo não encontrado."), 404
        rows = connection.execute(
            """
            SELECT channel, recipient, message, created_at
            FROM protocol_notifications
            WHERE protocol_id = %s ORDER BY created_at DESC
            """,
            (protocol_id,),
        ).fetchall()
    return jsonify(notifications=rows)


@app.get("/")
def index():
    return send_from_directory(ROOT, "index.html")


@app.get("/admin")
def admin():
    return send_from_directory(ROOT, "admin.html")


@app.get("/admin.html")
def admin_html():
    return send_from_directory(ROOT, "admin.html")


@app.get("/responsavel")
def responsible():
    return send_from_directory(ROOT, "responsavel.html")


@app.get("/responsavel.html")
def responsible_html():
    return send_from_directory(ROOT, "responsavel.html")
