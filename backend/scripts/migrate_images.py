"""One-time, idempotent migration of legacy local post images to Cloudinary.

Run from backend/: python -m scripts.migrate_images [--dry-run]
"""
import argparse
import logging
from pathlib import Path

import cloudinary
import cloudinary.uploader

from app.config import get_settings
from app.database.mongodb import get_database

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger("image_migration")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="report eligible records without uploading or updating")
    args = parser.parse_args()
    settings = get_settings()
    if not all((settings.cloudinary_cloud_name, settings.cloudinary_api_key, settings.cloudinary_api_secret)):
        parser.error("Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET")
    cloudinary.config(cloud_name=settings.cloudinary_cloud_name, api_key=settings.cloudinary_api_key,
                      api_secret=settings.cloudinary_api_secret, secure=True)

    upload_dir = Path(settings.upload_dir)
    files = {file.name: file for file in upload_dir.iterdir() if file.is_file()} if upload_dir.exists() else {}
    posts = get_database().posts
    candidates = list(posts.find({"$and": [
        {"featuredImage": {"$exists": True}},
        {"featuredImage": {"$not": {"$regex": "^https?://", "$options": "i"}}},
        {"featuredImage": {"$nin": [None, ""]}},
    ]}))
    for post in candidates:
        legacy_id = str(post.get("featuredImage", ""))
        file = files.get(Path(legacy_id).name)
        if not file or Path(legacy_id).name != legacy_id:
            logger.warning("Missing local file for post %s (legacy image %s)", post.get("slug"), legacy_id)
            continue
        if args.dry_run:
            logger.info("Would migrate post %s from %s", post.get("slug"), file.name)
            continue
        try:
            uploaded = cloudinary.uploader.upload(
                str(file), folder="blogfolio", public_id=file.stem,
                overwrite=True, resource_type="image",
            )
            result = posts.update_one(
                {"_id": post["_id"], "featuredImage": legacy_id},
                {"$set": {"featuredImage": uploaded["secure_url"], "featuredImagePublicId": uploaded["public_id"]}},
            )
            if result.modified_count:
                logger.info("Migrated post %s: %s -> %s", post.get("slug"), legacy_id, uploaded["public_id"])
            else:
                logger.warning("Skipped changed post %s; uploaded asset left intact for safety", post.get("slug"))
        except Exception:
            logger.exception("Migration failed for post %s (%s)", post.get("slug"), legacy_id)

    get_database().client.close()


if __name__ == "__main__":
    main()
