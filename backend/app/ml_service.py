"""Small in-memory Linear Regression model trained from MongoDB posts."""

from datetime import datetime, timezone

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

from app.database.mongodb import get_database

FEATURES = ["title_length", "word_count", "tag_count", "age_days"]
MIN_RECORDS = 5

_model: LinearRegression | None = None
_metrics: dict[str, float] | None = None
_training_records = 0


def _post_features(post: dict, now: datetime) -> list[float] | None:
    title = post.get("title")
    content = post.get("content")
    created_at = post.get("created_at")
    if not isinstance(title, str) or not isinstance(content, str) or not isinstance(created_at, datetime):
        return None
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    age_days = max(0.0, (now - created_at).total_seconds() / 86400)
    tags = post.get("tags", [])
    return [float(len(title)), float(len(content.split())), float(len(tags) if isinstance(tags, list) else 0), age_days]


def train_model() -> dict:
    global _model, _metrics, _training_records

    now = datetime.now(timezone.utc)
    records = list(get_database().posts.find(
        {"status": "active", "view_count": {"$exists": True}},
        {"title": 1, "content": 1, "tags": 1, "created_at": 1, "view_count": 1},
    ))
    samples = [(_post_features(post, now), post.get("view_count")) for post in records]
    samples = [(features, views) for features, views in samples if features is not None and isinstance(views, (int, float)) and views >= 0]
    if len(samples) < MIN_RECORDS:
        raise ValueError(f"At least {MIN_RECORDS} published posts with view data are needed; found {len(samples)}.")

    x = np.asarray([features for features, _ in samples], dtype=float)
    y = np.asarray([views for _, views in samples], dtype=float)
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)
    model = LinearRegression()
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)
    metrics = {
        "mae": float(mean_absolute_error(y_test, predictions)),
        "rmse": float(np.sqrt(mean_squared_error(y_test, predictions))),
        "r2": float(r2_score(y_test, predictions)) if len(y_test) > 1 else 0.0,
    }

    # Replace state only after a successful fit, so a failed retrain cannot corrupt it.
    _model, _metrics, _training_records = model, metrics, len(samples)
    return {"success": True, "message": "Linear Regression model trained.", "records_used": len(samples), "train_records": len(x_train), "test_records": len(x_test), "metrics": metrics}


def model_info() -> dict:
    return {"algorithm": "Linear Regression", "features": FEATURES, "target": "view_count", "training_records": _training_records, "metrics": _metrics, "trained": _model is not None}


def predict(features: list[float]) -> float:
    if _model is None:
        raise RuntimeError("Train the model before requesting a prediction.")
    return max(0.0, float(_model.predict(np.asarray([features], dtype=float))[0]))
