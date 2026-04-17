"""HTTP Basic Auth dependency for write endpoints.

Single-user model — credentials are read from settings (env vars LOGIN_USERNAME
and LOGIN_PASSWORD). Used by the admin frontend at /login and applied to all
write endpoints (post create/update/delete, publish webhook).
"""

import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from app.config import settings

basic_auth = HTTPBasic(realm="blog-admin")


def require_admin(
    credentials: HTTPBasicCredentials = Depends(basic_auth),
) -> str:
    """Validate Basic Auth credentials against the configured admin user.

    Returns the authenticated username on success. Raises 401 otherwise.
    `secrets.compare_digest` is used to avoid timing attacks.
    """
    correct_user = secrets.compare_digest(credentials.username, settings.login_username)
    correct_pass = secrets.compare_digest(credentials.password, settings.login_password)
    if not (correct_user and correct_pass):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": 'Basic realm="blog-admin"'},
        )
    return credentials.username
