#!/usr/bin/env python3

from movie_reviews.config import app, api
from flask_cors import CORS

from movie_reviews.api import ROUTE_MODULES


# Enable CORS for all routes
CORS(app)

# Register all API routes on import so they are available under Gunicorn (app:app)
for register in ROUTE_MODULES:
    register(api)


@app.route('/')
def index():
    return app.send_static_file('index.html')


if __name__ == '__main__':
    # Development server (not used in Docker/Railway)
    app.run(port=5555, debug=True)
