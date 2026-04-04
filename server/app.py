#!/usr/bin/env python3

from flask import request
from flask_cors import CORS
from movie_reviews.api import ROUTE_MODULES
from movie_reviews.config import api, app

# Enable CORS for all routes
CORS(app)

# Register all API routes on import so they are available under Gunicorn (app:app)
for register in ROUTE_MODULES:
    register(api)

_STATIC_EXT = frozenset(
    (
        "css",
        "gif",
        "ico",
        "jpeg",
        "jpg",
        "js",
        "json",
        "map",
        "png",
        "svg",
        "txt",
        "webp",
        "woff",
        "woff2",
        "xml",
    )
)


def _should_offer_spa_shell(path: str) -> bool:
    """True when a 404 should return the SPA index (production) instead of a hard 404."""
    if not path or path == "/":
        return False
    if path.startswith("/api") or path.startswith("/uploads/"):
        return False
    lower = path.lower()
    for prefix in ("/assets/", "/fonts/", "/images/"):
        if lower.startswith(prefix):
            return False
    last = path.rsplit("/", 1)[-1]
    if "." in last:
        ext = last.rsplit(".", 1)[-1].lower()
        if ext in _STATIC_EXT:
            return False
    return True


@app.errorhandler(404)
def spa_fallback_for_missing_static(exc):
    """
    With static_url_path='/', Flask maps /<path:filename> to files under dist/.
    Missing paths (e.g. /articles/1) raise 404; serve index.html so the client router can run.
    """
    if not app.static_folder or request.method not in ("GET", "HEAD"):
        return exc.get_response()
    if not _should_offer_spa_shell(request.path):
        return exc.get_response()
    return app.send_static_file("index.html")


@app.route("/")
def index():
    return app.send_static_file("index.html")


if __name__ == "__main__":
    # Development server (not used in Docker/Railway)
    app.run(port=5555, debug=True)
