"""Pages for crawlers: each page's <head>, and the sitemap. See app/services/seo.py."""

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services import seo

router = APIRouter(tags=["seo"])


@router.get("/seo/head", response_class=HTMLResponse, include_in_schema=False)
@router.get("/seo/head/{path:path}", response_class=HTMLResponse, include_in_schema=False)
async def page_head(request: Request, path: str = "", db: AsyncSession = Depends(get_db)) -> HTMLResponse:
    """The <head> tags of the public page at `/{path}`. nginx puts them in index.html for crawlers."""
    head = await seo.page_head(db, path, api_url=_own_url(request))
    return HTMLResponse(seo.render(head))


@router.get("/sitemap.xml", include_in_schema=False)
async def sitemap(db: AsyncSession = Depends(get_db)) -> Response:
    """Every published page in each of its languages. nginx serves it on the site's domain."""
    return Response(content=await seo.sitemap(db), media_type="application/xml")


def _own_url(request: Request) -> str:
    """This API's address, for covers stored as `/uploads/...`: https when the proxy in front says so."""
    url = str(request.base_url)
    if request.headers.get("x-forwarded-proto") == "https":
        url = url.replace("http://", "https://", 1)
    return url
