import json
import os
from pathlib import Path
from typing import Optional

from flask_restful import Resource

from movie_reviews.config import app


def _first_env(*keys: str) -> Optional[str]:
    for k in keys:
        v = os.getenv(k)
        if v and str(v).strip():
            return str(v).strip()
    return None


class Version(Resource):
    def get(self):
        # In production, app.static_folder should point to client/dist.
        static_folder = app.static_folder or ""
        version_path = Path(static_folder) / "version.json"

        if version_path.is_file():
            try:
                return json.loads(version_path.read_text(encoding="utf-8")), 200
            except Exception:
                # If the file exists but is malformed, fall through to env metadata.
                pass

        return {
            "gitSha": _first_env(
                "GIT_SHA",
                "COMMIT_SHA",
                "SOURCE_VERSION",
                "RAILWAY_GIT_COMMIT_SHA",
                "RAILWAY_GIT_COMMIT",
                "VERCEL_GIT_COMMIT_SHA",
                "GITHUB_SHA",
            ),
            "buildTime": _first_env("BUILD_TIME"),
        }, 200


def register_routes(api):
    api.add_resource(Version, "/api/version")
