from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import FileResponse

from app.auth import current_user
from app.config import get_settings

router = APIRouter(prefix="/api/uploads", tags=["Uploads"])


@router.post("")
async def upload(file: UploadFile = File(...), _: dict = Depends(current_user)):
    directory = Path(get_settings().upload_dir)
    directory.mkdir(parents=True, exist_ok=True)
    extension = Path(file.filename or "").suffix.lower()[:10]
    file_id = f"{uuid4().hex}{extension}"
    (directory / file_id).write_bytes(await file.read())
    return {"$id": file_id, "url": f"/uploads/{file_id}"}


@router.get("/{file_id}")
def file_view(file_id: str):
    path = Path(get_settings().upload_dir) / Path(file_id).name
    return FileResponse(path) if path.exists() else {"detail": "File not found"}


@router.delete("/{file_id}")
def delete_file(file_id: str, _: dict = Depends(current_user)):
    path = Path(get_settings().upload_dir) / Path(file_id).name
    if path.exists():
        path.unlink()
    return {"success": True}
