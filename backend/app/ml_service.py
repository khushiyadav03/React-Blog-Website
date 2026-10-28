"""Small in-memory log-linear engagement model trained from published posts."""
import logging
from datetime import datetime, timezone

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

from app.database.mongodb import get_database

logger = logging.getLogger(__name__)
FEATURES = ["title_length", "word_count", "tag_count", "age_days"]
MIN_RECORDS = 10
MIN_TARGET_VALUES = 2
MIN_EVALUATION_RECORDS = 3
_model: LinearRegression | None = None
_metrics: dict[str, float] | None = None
_training_records = 0
_feature_ranges: dict[str, tuple[float, float]] = {}


def _post_features(post: dict, now: datetime) -> list[float] | None:
    title, content, created_at = post.get("title"), post.get("content"), post.get("created_at")
    tags = post.get("tags", [])
    if not isinstance(title, str) or not isinstance(content, str) or not isinstance(created_at, datetime):
        return None
    if not isinstance(tags, list) or any(not isinstance(tag, str) for tag in tags):
        return None
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    age_days = (now - created_at).total_seconds() / 86400
    values = [len(title), len(content.split()), len(tags), age_days]
    if not all(np.isfinite(value) and value >= 0 for value in values):
        return None
    return [float(value) for value in values]


def train_model() -> dict:
    global _model, _metrics, _training_records, _feature_ranges
    now = datetime.now(timezone.utc)
    records = get_database().posts.find(
        {"status": "active", "view_count": {"$exists": True}},
        {"title": 1, "content": 1, "tags": 1, "created_at": 1, "view_count": 1},
    )
    samples = []
    for post in records:
        features = _post_features(post, now)
        views = post.get("view_count")
        if features is None or isinstance(views, bool) or not isinstance(views, (int, float)) or not np.isfinite(views) or views < 0:
            continue
        samples.append((features, float(views)))
    target_variation = len({views for _, views in samples})
    logger.info("ML training data: %d valid records, %d distinct view counts", len(samples), target_variation)
    if len(samples) < MIN_RECORDS:
        _model, _metrics, _training_records, _feature_ranges = None, None, len(samples), {}
        raise ValueError(f"Not enough training data: found {len(samples)} valid published posts; at least {MIN_RECORDS} are required.")
    if target_variation < MIN_TARGET_VALUES:
        _model, _metrics, _training_records, _feature_ranges = None, None, len(samples), {}
        raise ValueError("Not enough varied engagement data to train the model yet. Posts need different recorded view counts.")

    x = np.asarray([features for features, _ in samples], dtype=float)
    y = np.asarray([views for _, views in samples], dtype=float)
    y_log = np.log1p(y)
    x_train, x_test, y_train, y_test = train_test_split(x, y_log, test_size=0.2, random_state=42)
    metrics = None
    if len(x_test) >= MIN_EVALUATION_RECORDS:
        evaluation_model = LinearRegression().fit(x_train, y_train)
        evaluation_log_predictions = evaluation_model.predict(x_test)
        if np.any(evaluation_log_predictions < -1e-8):
            metrics = None
        else:
            predictions = np.expm1(evaluation_log_predictions)
            actual = np.expm1(y_test)
            metrics = {
                "mae": float(mean_absolute_error(actual, predictions)),
                "rmse": float(np.sqrt(mean_squared_error(actual, predictions))),
                "r2": float(r2_score(actual, predictions)) if len(actual) > 1 else None,
            }
    model = LinearRegression().fit(x, y_log)
    ranges = {feature: (float(x[:, index].min()), float(x[:, index].max())) for index, feature in enumerate(FEATURES)}
    _model, _metrics, _training_records, _feature_ranges = model, metrics, len(samples), ranges
    logger.info("ML training succeeded: %d training records, %d evaluation records, target variation=%d", len(x), len(x_test) if metrics else 0, target_variation)
    return {"success": True, "message": "Log-transformed Linear Regression model trained.", "records_used": len(samples), "train_records": len(x), "test_records": len(x_test), "metrics": metrics}


def model_info() -> dict:
    return {"algorithm": "Linear Regression (log1p views)", "features": FEATURES, "target": "view_count", "training_records": _training_records, "metrics": _metrics, "trained": _model is not None, "evaluation_available": _metrics is not None}


def predict(features: list[float]) -> int:
    if _model is None:
        raise RuntimeError("Not enough varied engagement data to train the model yet. Train it with at least 10 published posts with different view counts.")
    if len(features) != len(FEATURES) or not all(np.isfinite(value) and value >= 0 for value in features):
        raise ValueError("All prediction inputs must be finite, non-negative numbers.")
    for feature, value in zip(FEATURES, features):
        lower, upper = _feature_ranges[feature]
        # Permit a modest 20% margin around observed ranges, with a small floor for zero-valued features.
        margin = max((upper - lower) * 0.2, 1.0)
        if value < max(0.0, lower - margin) or value > upper + margin:
            raise ValueError(f"{feature} is outside the range supported by the training posts ({lower:.0f}–{upper:.0f}).")
    logger.info("ML prediction input validated: %s", dict(zip(FEATURES, features)))
    log_prediction = float(_model.predict(np.asarray([features], dtype=float))[0])
    # expm1 can produce a tiny negative due to floating point; count outputs cannot be negative.
    estimate = float(np.expm1(log_prediction))
    if estimate < -1e-8:
        logger.warning("ML model produced an invalid negative view estimate")
        raise ValueError("The model could not produce a reliable non-negative estimate for these inputs. Try values closer to existing posts or collect more view data.")
    # Remove only floating-point noise around zero; materially negative model results are errors.
    estimate = max(0.0, estimate)
    result = int(round(estimate))
    logger.info("ML prediction succeeded: %d estimated views", result)
    return result
