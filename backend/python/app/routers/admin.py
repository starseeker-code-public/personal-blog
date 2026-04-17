"""Admin-only endpoints — auth-required, not part of the public API contract."""

import secrets
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.post import Post
from app.schemas.post import PostOut
from app.security import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])

UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

_ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
_EXT_FOR_TYPE = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
_MAX_BYTES = 8 * 1024 * 1024  # 8 MB


@router.get("/drafts", response_model=list[PostOut])
async def list_drafts(
    db: AsyncSession = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    """All draft posts in canonical PostOut shape, newest first."""
    result = await db.execute(
        select(Post)
        .where(Post.draft.is_(True))
        .order_by(Post.published_at.desc())
        .options(
            selectinload(Post.tags),
            selectinload(Post.category),
            selectinload(Post.author),
        )
    )
    drafts = result.scalars().all()
    return [PostOut.from_orm_post(p) for p in drafts]


@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    _admin: str = Depends(require_admin),
) -> dict[str, str]:
    """Store an uploaded image under /uploads and return its public URL."""
    if file.content_type not in _ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported type {file.content_type!r}. Allowed: {sorted(_ALLOWED_TYPES)}",
        )

    data = await file.read()
    if len(data) > _MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image too large ({len(data)} bytes). Limit: {_MAX_BYTES} bytes.",
        )

    filename = f"{secrets.token_hex(12)}{_EXT_FOR_TYPE[file.content_type]}"
    (UPLOAD_DIR / filename).write_bytes(data)
    return {"url": f"/uploads/{filename}"}
