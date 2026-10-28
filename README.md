# School Management System

A Flask + static frontend school portal (students, results, syllabus, event photos, admin).

## Local run

```bash
pip install flask werkzeug
python app.py
```

Open http://127.0.0.1:5000

## Cross-device persistence (Netlify)

Netlify static hosting alone cannot persist data: each browser keeps its own
copy in `localStorage`, so a delete on one device does not affect others.

To make changes permanent for everyone:

1. Deploy `app.py` (and the `data/` + `static/uploads/` folders) to a persistent
   host (Render, Railway, PythonAnywhere, a VPS, ...). The backend already stores
   data in `data/*.json` and uploaded files under `static/uploads/`.
2. In `netlify.toml`, uncomment the `/api/*` redirect and set `BACKEND_URL` to
   your backend host. Redeploy Netlify.
   - Alternatively, set `window.SCHOOL_API_BASE_URL = 'https://your-backend'`
     before `script.js` loads (e.g. in `static/template/index.html`).
3. Ensure the backend host allows CORS from your Netlify domain if it is on a
   different origin (the Flask app can be wrapped with flask-cors).

Until a shared backend is connected, the site runs in local (per-browser) mode.