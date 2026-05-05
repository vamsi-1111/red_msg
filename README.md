# red_msg

Project scaffold for a Reddit control system with a FastAPI backend, job queue worker pattern, and a simple frontend shell.

## Branching

Work for this setup is on a feature branch, not `main`:

- `feature/reddit-ui-job-queue`

## Target Structure

```text
reddit_ui/
├── backend/
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── schemas.py
│       ├── api/
│       │   ├── __init__.py
│       │   └── routes.py
│       └── services/
│           ├── __init__.py
│           └── red_runner.py
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── styles.css
└── red.exe
```

## Architecture Intent (Blueprint Only)

Flow:

1. User sends command request to backend (post, DM, read replies).
2. Backend creates a job entry and queues it.
3. Worker (`red_runner`) executes `red.exe` in background.
4. Result (success/error/output) is saved in SQLite.
5. User checks job status via API.

Current repository state is structure-only with placeholders; runtime logic is intentionally not implemented yet.
