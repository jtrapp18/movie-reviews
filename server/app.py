#!/usr/bin/env python3

from lib.config import app, api
from flask_cors import CORS

from lib.api import ROUTE_MODULES


# Enable CORS for all routes
CORS(app)

@app.route('/')
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    for register in ROUTE_MODULES:
        register(api)
    app.run(port=5555, debug=True)
