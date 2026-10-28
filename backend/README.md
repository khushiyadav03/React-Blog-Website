# React Blog API

FastAPI and PyMongo backend for the React blog.

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

Set `MONGODB_URI`, `MONGODB_DATABASE`, `JWT_SECRET`, and `CORS_ORIGINS` in `.env`. The API docs are available at `http://localhost:8000/docs`.

Collections: `users`, `posts`, `profiles`, and `bookmarks`. Uploaded files are stored under `UPLOAD_DIR` for local development; production deployments should use object storage and keep only the resulting file ID/URL in MongoDB.
