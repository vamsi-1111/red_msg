from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict
from datetime import datetime
import sqlite3
import secrets
import praw
import uvicorn
from dotenv import load_dotenv
import os
from datetime import timedelta
from jose import jwt, JWTError


# =========================================================
# JWT_TOKEN
# =========================================================

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")

# =========================================================
# FASTAPI
# =========================================================

app = FastAPI()
security = HTTPBasic()

# =========================================================
# CONFIG
# =========================================================

USERNAME = "admin"
PASSWORD = "secret123"

IP_WHITELIST = {
    "127.0.0.1",
    "::1",
    "YOUR_IP_HERE"
}

DB_NAME = "logs.db"

# =========================================================
# REDDIT
# =========================================================

reddit = praw.Reddit(
    client_id="CLIENT_ID",
    client_secret="CLIENT_SECRET",
    username="BOT_USERNAME",
    password="BOT_PASSWORD",
    user_agent="fastapi-reddit-bot"
)

# =========================================================
# SQLITE
# =========================================================

def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event TEXT,
        username TEXT,
        ip TEXT,
        details TEXT,
        created_at TEXT
    )
    """)

    conn.commit()
    conn.close()


def log_event(event, username="", ip="", details=""):
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    c.execute("""
    INSERT INTO logs (
        event,
        username,
        ip,
        details,
        created_at
    )
    VALUES (?, ?, ?, ?, ?)
    """, (
        event,
        username,
        ip,
        details,
        datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    ))

    conn.commit()
    conn.close()


def get_logs():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    c.execute("""
    SELECT
        event,
        username,
        ip,
        details,
        created_at
    FROM logs
    ORDER BY id DESC
    LIMIT 300
    """)

    rows = c.fetchall()

    conn.close()

    return rows

# =========================================================
# SECURITY
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

@app.middleware("http")
async def ip_whitelist(request: Request, call_next):

    ip = request.headers.get(
        "x-forwarded-for",
        request.client.host
    ).split(",")[0].strip()

    path = request.url.path
    method = request.method

    # log all requests
    log_event(
        event="request",
        ip=ip,
        details=f"{method} {path}"
    )

    # block non-whitelisted IPs
    if ip not in IP_WHITELIST:

        log_event(
            event="blocked_ip",
            ip=ip,
            details=f"{method} {path}"
        )

        return HTMLResponse(
            content="Forbidden",
            status_code=403
        )

    response = await call_next(request)

    return response


def verify(
    credentials: HTTPBasicCredentials = Depends(security)
):
    ok_user = secrets.compare_digest(
        credentials.username,
        USERNAME
    )

    ok_pass = secrets.compare_digest(
        credentials.password,
        PASSWORD
    )

    if not (ok_user and ok_pass):
        raise HTTPException(
            status_code=401,
            detail="Unauthorized",
            headers={"WWW-Authenticate": "Basic"},
        )

# =========================================================
# REDDIT FUNCTIONS
# =========================================================

def send_dm(subject, to_username, body, ip=""):

    reddit.redditor(to_username).message(
        subject=subject,
        message=body
    )

    log_event(
        event="send_dm",
        username=to_username,
        ip=ip,
        details=body[:300]
    )

    return {
        "success": True,
        "to": to_username
    }

def create_post(
    subreddit_name,
    title,
    text,
    ip="",
    flairs={}
):

    subreddit = reddit.subreddit(subreddit_name)

    if subreddit_name in flairs:

        post = subreddit.submit(
            title,
            selftext=text,
            flair_id=flairs[subreddit_name]
        )

    else:
        post = subreddit.submit(
            title,
            selftext=text
        )

    log_event(
        event="create_post",
        username=subreddit_name,
        ip=ip,
        details=title
    )

    return {
        "success": True,
        "url": post.url
    }

def get_replied(dt):

    outbox_users = set()

    for sent_msg in reddit.inbox.sent(limit=None):

        if (
            isinstance(sent_msg, praw.models.Message)
            and sent_msg.dest
        ):
            outbox_users.add(
                sent_msg.dest.name.lower()
            )

    msgs_by_user = defaultdict(list)

    for msg in reddit.inbox.unread(limit=None):

        if (
            isinstance(msg, praw.models.Message)
            and msg.author
            and datetime.utcfromtimestamp(
                msg.created_utc
            ) >= dt
        ):

            author_name = msg.author.name.lower()

            if author_name in outbox_users:

                msgs_by_user[author_name].append({
                    "body": msg.body,
                    "time": datetime.utcfromtimestamp(
                        msg.created_utc
                    ).strftime("%Y-%m-%d %H:%M:%S UTC")
                })

    return msgs_by_user

# =========================================================
# ROUTES
# =========================================================

@app.get("/")
def home():
    return {
        "status": "running"
    }

@app.post("/auth")
async def auth(
    request: Request
): 
    form = await request.form()
    username = form.get("username")
    password = form.get("password")

    username_result = secrets.compare_digest(
        username,
        USERNAME
    )

    password_result = secrets.compare_digest(
        password,
        PASSWORD
    )

    if(username_result and password_result):
        token = jwt.encode(
            {"sub": username,
             "role": "user"
            },
            SECRET_KEY,
            algorithm="HS256"
        )
        return {"success": True, "token": token}
    else:
        return {"success": False}

@app.post("/tokenAuth")
async def tokenAuth(
    request: Request
):
    token = request.headers.get("Authorization").replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {"valid": True}
    except JWTError:
        return {"valid": False}

@app.post("/dm")
def dm(
    request: Request,
    subject: str,
    username: str,
    body: str,
):

    ip = request.headers.get(
        "x-forwarded-for",
        request.client.host
    ).split(",")[0].strip()

    return send_dm(
        subject=subject,
        to_username=username,
        body=body,
        ip=ip
    )

@app.post("/post")
def post(
    request: Request,
    subreddit: str,
    title: str,
    text: str,
):

    ip = request.headers.get(
        "x-forwarded-for",
        request.client.host
    ).split(",")[0].strip()

    return create_post(
        subreddit_name=subreddit,
        title=title,
        text=text,
        ip=ip
    )

@app.get("/replies")
def replies(
):

    dt = datetime.utcnow().replace(
        hour=0,
        minute=0,
        second=0
    )

    return get_replied(dt)


@app.get("/logs", response_class=HTMLResponse)
def logs(
):

    rows = get_logs()

    html = """
    <html>
    <head>
        <title>Bot Logs</title>

        <style>

            body {
                font-family: Arial;
                padding: 20px;
                background: #f5f5f5;
            }

            h1 {
                margin-bottom: 20px;
            }

            table {
                border-collapse: collapse;
                width: 100%;
                background: white;
            }

            td, th {
                border: 1px solid #ccc;
                padding: 8px;
                font-size: 14px;
            }

            th {
                background: #eee;
            }

            tr:nth-child(even) {
                background: #fafafa;
            }

        </style>

    </head>

    <body>

        <h1>Bot Logs</h1>

        <table>

            <tr>
                <th>Event</th>
                <th>Username</th>
                <th>IP</th>
                <th>Details</th>
                <th>Time</th>
            </tr>
    """

    for row in rows:

        html += f"""
        <tr>
            <td>{row[0]}</td>
            <td>{row[1]}</td>
            <td>{row[2]}</td>
            <td>{row[3]}</td>
            <td>{row[4]}</td>
        </tr>
        """

    html += """

        </table>

    </body>
    </html>
    """

    return HTMLResponse(content=html)

# =========================================================
# START
# =========================================================

if __name__ == "__main__":

    init_db()

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )
