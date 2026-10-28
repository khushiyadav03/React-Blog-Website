import logging
from pathlib import Path
from uuid import uuid4

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.auth import current_user
from app.config import get_settings

router = APIRouter(prefix="/api/uploads", tags=["Uploads"])
logger = logging.getLogger(__name__)
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"}


def configure_cloudinary() -> bool:
    settings = get_settings()
    if not all((settings.cloudinary_cloud_name, settings.cloudinary_api_key, settings.cloudinary_api_secret)):
        return False
    cloudinary.config(cloud_name=settings.cloudinary_cloud_name, api_key=settings.cloudinary_api_key,
                      api_secret=settings.cloudinary_api_secret, secure=True)
    return True


@router.post("")
async def upload(file: UploadFile = File(...), _: dict = Depends(current_user)):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Only JPEG, PNG, GIF, and WebP images are supported")
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded image is empty")
    if not configure_cloudinary():
        raise HTTPException(status_code=503, detail="Image storage is not configured")
    try:
        result = cloudinary.uploader.upload(contents, folder="blogfolio", resource_type="image")
    except Exception as error:
        logger.exception("Cloudinary image upload failed")
        raise HTTPException(status_code=502, detail="Image upload failed; please try again") from error
    logger.info("Cloudinary upload succeeded: %s", result.get("public_id"))
    return {"$id": result["public_id"], "public_id": result["public_id"], "url": result["secure_url"]}


@router.get("/{file_id}")
def file_view(file_id: str):
    if file_id.startswith(("http://", "https://")):
        return {"detail": "Use the stored image URL directly"}
    path = Path(get_settings().upload_dir) / Path(file_id).name
    return FileResponse(path) if path.exists() else {"detail": "File not found"}


@router.delete("/{file_id}")
def delete_file(file_id: str, _: dict = Depends(current_user)):
    if file_id.startswith(("http://", "https://")):
        from urllib.parse import unquote, urlparse
        path = unquote(urlparse(file_id).path)
        marker = "/upload/"
        if marker not in path:
            raise HTTPException(status_code=400, detail="Invalid Cloudinary image URL")
        public_id = path.split(marker, 1)[1].split("/", 1)[-1]
        public_id = str(Path(public_id).with_suffix(""))
        if not configure_cloudinary():
            raise HTTPException(status_code=503, detail="Image storage is not configured")
        cloudinary.uploader.destroy(public_id, resource_type="image")
        return {"success": True}
    if "/" in file_id or "\\" in file_id:
        # Cloudinary public IDs are allowed, but local legacy file IDs must be basenames.
        if file_id.startswith("blogfolio/") and configure_cloudinary():
            cloudinary.uploader.destroy(file_id, resource_type="image")
            return {"success": True}
        raise HTTPException(status_code=400, detail="Invalid image identifier")
    path = Path(get_settings().upload_dir) / Path(file_id).name
    if path.exists():
        path.unlink()
    return {"success": True}
