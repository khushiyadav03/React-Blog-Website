from functools import lru_cache
from pymongo import ASCENDING, DESCENDING, MongoClient

from app.config import get_settings


@lru_cache
def get_client() -> MongoClient:
    return MongoClient(get_settings().mongodb_uri, serverSelectionTimeoutMS=5000)


def get_database():
    return get_client()[get_settings().mongodb_database]


def initialize_indexes() -> None:
    database = get_database()
    database.users.create_index([("email", ASCENDING)], unique=True)
    database.posts.create_index([("slug", ASCENDING)], unique=True)
    database.posts.create_index([("status", ASCENDING), ("created_at", DESCENDING)])
    database.posts.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    database.profiles.create_index([("user_id", ASCENDING)], unique=True)
    database.bookmarks.create_index([("user_id", ASCENDING), ("post_id", ASCENDING)], unique=True)
