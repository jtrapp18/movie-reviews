# Stage 1: Install Python dependencies
FROM python:3.8-slim AS python-base

WORKDIR /app

COPY requirements.txt ./

# Direct binary install without apt-get memory overhead
RUN pip install --no-cache-dir --only-binary=:all: -r requirements.txt


# Stage 2: Build React app
FROM node:18-alpine AS frontend-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build


# Stage 3: Final Production Image
FROM python-base AS final

ENV FLASK_ENV=production
ENV PORT=8000

WORKDIR /app

# Copy built React app from frontend-build stage
COPY --from=frontend-build /app/client/dist ./client/dist

# Copy Flask backend
COPY server ./server
RUN pip install --no-deps -e ./server

EXPOSE ${PORT}
CMD ["sh", "-c", "gunicorn --chdir server --log-level info -b 0.0.0.0:${PORT} app:app"]
# Copy Flask backend
COPY server ./server
RUN pip install --no-deps -e ./server

EXPOSE ${PORT}
CMD ["sh", "-c", "gunicorn --chdir server --log-level info -b 0.0.0.0:${PORT} app:app"]
WORKDIR /app

# Copy built React app from frontend-build stage
COPY --from=frontend-build /app/client/dist ./client/dist

# Copy Flask backend
COPY server ./server
RUN pip install --no-deps -e ./server

EXPOSE ${PORT}
CMD ["sh", "-c", "gunicorn --chdir server --log-level info -b 0.0.0.0:${PORT} app:app"]
