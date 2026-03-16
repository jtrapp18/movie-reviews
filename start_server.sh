#!/bin/bash

# Start the Flask server for movie reviews
echo "🚀 Starting Movie Reviews Server..."
echo "=================================="

# Activate virtual environment
source .venv/bin/activate

# Change to server directory
cd server

# Editable install so movie_reviews is importable (run once per venv)
pip install -e . --quiet

# Start the Flask app
echo "Starting Flask server on http://localhost:5555"
python app.py
