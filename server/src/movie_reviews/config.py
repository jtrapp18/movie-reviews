import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData

load_dotenv()


# Determine if the app is in development or production
is_dev = os.environ.get("FLASK_ENV") == "development"

# Conditionally set static and template folder paths based on environment
if is_dev:
    # In development, Flask doesn't need to serve static files
    app = Flask(__name__)  # No need to set static_folder or template_folder
else:

    def _find_frontend_dist_dir() -> str:
        """
        Locate the Vite build output directory (client/dist) without assuming a fixed
        repo folder depth. Allows explicit override via FRONTEND_DIST_DIR.
        """
        override = os.getenv("FRONTEND_DIST_DIR")
        if override:
            return str(Path(override).expanduser().resolve())

        here = Path(__file__).resolve()
        for parent in (here.parent, *here.parents):
            candidate = parent / "client" / "dist"
            if candidate.is_dir():
                return str(candidate)

        # Fall back to the historical assumption (repo root is 3 levels up from this file)
        return str((here.parents[2] / "client" / "dist").resolve())

    dist_path = _find_frontend_dist_dir()

    app = Flask(
        __name__,
        static_url_path="/",
        static_folder=dist_path,
        template_folder=dist_path,
    )

app.config["SECRET_KEY"] = (
    b"\x8a\xe7F\xc2)\\\x1cV\xa0\x8a\x94\xf5i-\xe5\x1a>0~\x19\xb1{\x99\xbe"
)
# Debug environment variables
print(f"DATABASE_PUBLIC_URL: {os.getenv('DATABASE_PUBLIC_URL')}")
print(f"DATABASE_URL: {os.getenv('DATABASE_URL')}")

database_uri = os.getenv("DATABASE_PUBLIC_URL") or os.getenv("DATABASE_URL")
print(f"Using database URI: {database_uri}")

app.config["SQLALCHEMY_DATABASE_URI"] = database_uri
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.json.compact = False

metadata = MetaData(
    naming_convention={
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    }
)

db = SQLAlchemy(metadata=metadata)
migrate = Migrate(app, db)
db.init_app(app)

bcrypt = Bcrypt(app)

api = Api(app)
