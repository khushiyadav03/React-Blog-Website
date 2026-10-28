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

Set `MONGODB_URI`, `MONGODB_DATABASE`, `JWT_SECRET`, `CORS_ORIGINS`, and the three `CLOUDINARY_*` values in `.env`. The API docs are available at `http://localhost:8000/docs`.

Collections: `users`, `posts`, `profiles`, and `bookmarks`. New uploads are sent to Cloudinary; `UPLOAD_DIR` remains mounted to serve old local images during migration.

To migrate legacy post covers from the local `uploads/` directory, run from `backend/` after configuring MongoDB and Cloudinary in `.env`:

```powershell
python -m scripts.migrate_images --dry-run
python -m scripts.migrate_images
```

The migration preserves local files, skips already migrated URLs, and can be safely rerun.
