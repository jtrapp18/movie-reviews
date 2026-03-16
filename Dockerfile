# Multi-stage build: First stage for building React app
FROM node:18-alpine AS frontend-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Second stage: Python backend with built frontend
FROM python:3.8-slim

# Install system dependencies for PostgreSQL and Python
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && apt-get clean

# Environment configuration
ENV FLASK_ENV=production
ENV PORT=8000

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the built React app from the first stage
COPY --from=frontend-build /app/client/dist ./client/dist

# Copy the Flask backend and install as editable so movie_reviews is importable
COPY server ./server
RUN pip install -e ./server

# Expose the port and set the command to start Gunicorn
EXPOSE ${PORT}
CMD ["sh", "-c", "gunicorn --chdir server --log-level info -b 0.0.0.0:${PORT} app:app"]
