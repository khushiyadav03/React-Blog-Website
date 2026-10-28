from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.auth import current_user
from app.database.mongodb import get_database
from app.routes_blogs import serialize
from app.schemas import ProfileUpdate

router = APIRouter(prefix="/api", tags=["Profiles and bookmarks"])


def profile_json(document):
    if not document:
        return None
    return {"$id": str(document["_id"]), "userID": str(document["user_id"]), **{key: document.get(key, "") for key in ("name", "bio", "avatar", "website", "github", "linkedin")}}


@router.get("/profiles/{user_id}")
def get_profile(user_id: str):
    if not ObjectId.is_valid(user_id):
        return None
    return profile_json(get_database().profiles.find_one({"user_id": ObjectId(user_id)}))


@router.put("/profiles/me")
def update_profile(data: ProfileUpdate, user: dict = Depends(current_user)):
    values = data.model_dump()
    values.update({"user_id": user["_id"], "updated_at": datetime.now(timezone.utc)})
    get_database().profiles.update_one({"user_id": user["_id"]}, {"$set": values}, upsert=True)
    return profile_json(get_database().profiles.find_one({"user_id": user["_id"]}))


@router.get("/bookmarks")
def get_bookmarks(user: dict = Depends(current_user)):
    documents = []
    for bookmark in get_database().bookmarks.find({"user_id": user["_id"]}).sort("created_at", -1):
        documents.append({"$id": str(bookmark["_id"]), "userID": str(user["_id"]), "postID": bookmark["post_id"], "created_at": bookmark["created_at"].isoformat()})
    return {"documents": documents, "total": len(documents)}


@router.get("/bookmarks/{post_id}")
def get_bookmark(post_id: str, user: dict = Depends(current_user)):
    bookmark = get_database().bookmarks.find_one({"user_id": user["_id"], "post_id": post_id})
    if not bookmark:
        return None
    return {"$id": str(bookmark["_id"]), "userID": str(user["_id"]), "postID": post_id, "created_at": bookmark["created_at"].isoformat()}


@router.post("/bookmarks/{post_id}")
def toggle_bookmark(post_id: str, user: dict = Depends(current_user)):
    database = get_database()
    existing = database.bookmarks.find_one({"user_id": user["_id"], "post_id": post_id})
    if existing:
        database.bookmarks.delete_one({"_id": existing["_id"]})
        return None
    document = {"user_id": user["_id"], "post_id": post_id, "created_at": datetime.now(timezone.utc)}
    result = database.bookmarks.insert_one(document)
    return {"$id": str(result.inserted_id), "userID": str(user["_id"]), "postID": post_id, "created_at": document["created_at"].isoformat()}
