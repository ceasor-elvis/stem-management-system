FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY pyproject.toml .

# Install uv and build all wheels
RUN pip install --no-cache-dir uv

# Prefer uv if available
RUN uv sync

# Project
COPY . .

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app \
    DJANGO_SETTINGS_MODULE=backend_api.settings

EXPOSE 8000

CMD ["uv", "run", "gunicorn", "backend_api.wsgi:application", "--bind", "0.0.0.0:8000"]
