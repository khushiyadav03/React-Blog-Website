# React Blog

A full-stack blogging application with a React/Vite frontend and FastAPI backend. MongoDB is accessed directly through PyMongo. The app includes JWT authentication, post CRUD, author profiles, bookmarks, uploads, search, and a small Linear Regression feature that estimates post views.

## Architecture

```text
React pages/components → src/services/config.js or auth.js → HTTP API
→ FastAPI routers → PyMongo collections → MongoDB
                         └→ ML service (scikit-learn)
```

### Collections

- `users`: email, name, bcrypt password hash, creation time
- `posts`: slug, title/content/tags, author ObjectId, status, timestamps, and `view_count`
- `profiles`: public profile fields keyed by user ObjectId
- `bookmarks`: user ObjectId, post slug, creation time

MongoDB creates unique indexes for user email, post slug, profile user, and user/post bookmarks, plus post listing indexes. Uploaded image files are stored on disk in `backend/uploads` by default; the post stores the returned file identifier.

## Features and API flow

JWT bearer tokens are issued at registration/login and stored by the frontend in local storage. Protected routes use FastAPI's `current_user` dependency, which validates token signature/expiry and loads the user through PyMongo. Post update/delete also compare the authenticated user's ObjectId with the post author.

Post create/read/update/delete are implemented at `/api/blogs`. Public post detail reads increment `view_count`; the list page does not. Profile upsert, bookmark toggle/list, multipart uploads, and title search use their own routes below. API responses retain the `$id`, `userID`, `documents`, and `total` fields expected by the React UI.

## Machine learning

The ML feature is scikit-learn `LinearRegression`. It predicts a published post's recorded `view_count` from four inputs: title character count, content word count, tag count, and post age in days. The training service retrieves published post records with PyMongo, prepares those inputs and labels, performs a reproducible 80/20 train/test split, fits the model, and reports MAE, RMSE, and R². It needs at least five published records. New post detail visits contribute view observations.

The model stays in backend memory. It is not persisted to disk, so retrain it after a backend restart. Training and prediction endpoints require authentication. The metrics describe the current small dataset and should not be treated as reliable real-world traffic forecasts.

### ML endpoints

`POST /api/ml/train` (auth required, empty body) trains/retrains from MongoDB and returns record counts and metrics. `GET /api/ml/model-info` (auth required) reports algorithm, features, target, metrics, and trained status. `POST /api/ml/predict` (auth required) expects `title_length`, `word_count`, `tag_count`, and `age_days`; it returns a non-negative estimated view count. Prediction before training returns HTTP 409; insufficient training data returns HTTP 422.

Example request:

```json
{
  "title_length": 40,
  "word_count": 500,
  "tag_count": 3,
  "age_days": 7
}
```

Example response:

```json
{
  "success": true,
  "prediction": 12.5,
  "unit": "expected post views"
}
```

## API summary

| Method | Path | Auth | Request / purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | `{name,email,password}`; create account and issue token |
| POST | `/api/auth/login` | No | `{email,password}`; issue token |
| GET | `/api/auth/me` | Yes | Return current user |
| POST | `/api/auth/logout` | Yes | Compatibility logout acknowledgement; frontend clears local token |
| GET | `/api/blogs?status=&author=&search=` | No | List/filter posts |
| GET | `/api/blogs/{slug}` | No | Retrieve post and count a published detail view |
| POST | `/api/blogs` | Yes | Create post from validated blog fields |
| PUT | `/api/blogs/{slug}` | Yes | Update own post |
| DELETE | `/api/blogs/{slug}` | Yes | Delete own post |
| GET | `/api/profiles/{user_id}` | No | Read public profile |
| PUT | `/api/profiles/me` | Yes | Upsert current user's profile |
| GET | `/api/bookmarks` | Yes | List current user's saved post IDs |
| GET | `/api/bookmarks/{post_id}` | Yes | Get saved state for one post |
| POST | `/api/bookmarks/{post_id}` | Yes | Toggle bookmark on/off |
| POST | `/api/uploads` | Yes | Multipart `file`; upload and return file ID/URL |
| GET | `/uploads/{file_id}` | No | Serve uploaded file |
| DELETE | `/api/uploads/{file_id}` | Yes | Delete uploaded file |
| POST | `/api/ml/train` | Yes | Train model using MongoDB post records |
| POST | `/api/ml/predict` | Yes | Predict expected views from feature values |
| GET | `/api/ml/model-info` | Yes | Read current in-memory model status and metrics |
| GET | `/api/health` | No | Basic API health response |

## Setup

Requirements: Node.js 20+, Python 3.11+, and a reachable MongoDB instance (local or Atlas).

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

Set `MONGODB_URI`, `MONGODB_DATABASE`, `JWT_SECRET`, `CORS_ORIGINS`, and optionally `UPLOAD_DIR` in `backend/.env`. API docs: `http://localhost:8000/docs`.

### Frontend

From the project root:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Set `VITE_API_BASE_URL=http://localhost:8000` and optionally `VITE_TINYMCE_API_KEY` in the root `.env`. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

### Train and predict

Sign in, open **Dashboard → Predict post engagement**, then select **Train model**. At least five published posts need to exist; opening their detail pages records views. After training, enter the four input values and select **Predict engagement**. The same operations are available through the authenticated API endpoints above.

Legacy edit URLs such as `/edit-post/python-basics` redirect to `/dashboard/posts/python-basics/edit` while preserving the slug.
