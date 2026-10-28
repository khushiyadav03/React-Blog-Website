from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth import current_user
from app.ml_service import FEATURES, model_info, predict, train_model

router = APIRouter(prefix="/api/ml", tags=["Machine learning"], dependencies=[Depends(current_user)])


class PredictionRequest(BaseModel):
    title_length: int = Field(ge=1, le=200)
    word_count: int = Field(ge=1, le=100000)
    tag_count: int = Field(ge=0, le=50)
    age_days: float = Field(ge=0, le=36500)


@router.post("/train")
def train():
    try:
        return train_model()
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@router.post("/predict")
def prediction(data: PredictionRequest):
    try:
        result = predict([getattr(data, feature) for feature in FEATURES])
    except RuntimeError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    return {"success": True, "estimated_views": result, "prediction": result, "unit": "expected post views"}


@router.get("/model-info")
def info():
    return model_info()
