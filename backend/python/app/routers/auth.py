"""Auth endpoints for the admin frontend.

Only one endpoint: GET /api/auth/me — returns 200 + the username when the
Basic Auth header validates, 401 otherwise. The /login page uses this to
verify credentials before storing them in sessionStorage.
"""

from fastapi import APIRouter, Depends

from app.security import require_admin

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me")
async def me(username: str = Depends(require_admin)) -> dict[str, str]:
    return {"username": username}
