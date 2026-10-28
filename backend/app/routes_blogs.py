from datetime import datetime, timezone
import logging
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError, PyMongoError

from app.auth import current_user
from app.database.mongodb import get_database
from app.schemas import BlogCreate, BlogUpdate

router = APIRouter(prefix="/api/blogs", tags=["Blogs"])
logger = logging.getLogger(__name__)


def serialize(document: dict) -> dict:
    return {
        "$id": document["slug"],
        "title": document["title"],
        "content": document["content"],
        "featuredImage": document.get("featuredImage", ""),
        "featuredImagePublicId": document.get("featuredImagePublicId"),
        "status": document.get("status", "draft"),
        "userID": str(document["user_id"]),
        "excerpt": document.get("excerpt", ""),
        "tags": document.get("tags", []),
        "viewCount": document.get("view_count", 0),
        "$createdAt": document["created_at"].isoformat(),
        "$updatedAt": document["updated_at"].isoformat(),
    }


def find_post(identifier: str) -> dict | None:
    query: dict[str, Any] = {"slug": identifier}
    if ObjectId.is_valid(identifier):
        query = {"$or": [{"slug": identifier}, {"_id": ObjectId(identifier)}]}
    return get_database().posts.find_one(query)


@router.get("")
def list_blogs(status_filter: str | None = Query(default=None, alias="status"), author: str | None = None, search: str | None = None):
    query: dict[str, Any] = {}
    if status_filter:
        query["status"] = status_filter
    if author:
        query["user_id"] = ObjectId(author) if ObjectId.is_valid(author) else author
    if search:
        query["title"] = {"$regex": search, "$options": "i"}
    documents = [serialize(post) for post in get_database().posts.find(query).sort("created_at", -1)]
    return {"documents": documents, "total": len(documents)}


@router.get("/{identifier}")
def get_blog(identifier: str):
    post = find_post(identifier)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return serialize(post)


@router.post("/{identifier}/view")
def record_blog_view(identifier: str):
    """Count one public read of an active post, using an atomic database increment."""
    try:
        post = find_post(identifier)
        if not post or post.get("status") != "active":
            raise HTTPException(status_code=404, detail="Published post not found")
        updated = get_database().posts.find_one_and_update(
            {"_id": post["_id"], "status": "active"},
            {"$inc": {"view_count": 1}},
            return_document=ReturnDocument.AFTER,
            projection={"view_count": 1},
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Published post not found")
        return {"view_count": updated.get("view_count", 0)}
    except HTTPException:
        raise
    except PyMongoError as error:
        logger.exception("Could not record view for post %s", identifier)
        raise HTTPException(status_code=500, detail="Could not record post view") from error


@router.post("", status_code=status.HTTP_201_CREATED)
def create_blog(data: BlogCreate, user: dict = Depends(current_user)):
    now = datetime.now(timezone.utc)
    document = {**data.model_dump(), "user_id": user["_id"], "created_at": now, "updated_at": now, "view_count": 0}
    try:
        result = get_database().posts.insert_one(document)
    except DuplicateKeyError as error:
        raise HTTPException(status_code=409, detail="A post with this slug already exists") from error
    return serialize(get_database().posts.find_one({"_id": result.inserted_id}))


@router.put("/{identifier}")
def update_blog(identifier: str, data: BlogUpdate, user: dict = Depends(current_user)):
    post = find_post(identifier)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post["user_id"] != user["_id"]:
        raise HTTPException(status_code=403, detail="You can only edit your own posts")
    values = data.model_dump(exclude_none=True)
    values["updated_at"] = datetime.now(timezone.utc)
    get_database().posts.update_one({"_id": post["_id"]}, {"$set": values})
    return serialize(get_database().posts.find_one({"_id": post["_id"]}))


@router.delete("/{identifier}")
def delete_blog(identifier: str, user: dict = Depends(current_user)):
    post = find_post(identifier)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post["user_id"] != user["_id"]:
        raise HTTPException(status_code=403, detail="You can only delete your own posts")
    get_database().posts.delete_one({"_id": post["_id"]})
    return {"success": True}
