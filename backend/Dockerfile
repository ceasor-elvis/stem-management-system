FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY pyproject.toml .
# If you also have a lock file, copy it too
# COPY requirements.txt .

RUN pip install --upgrade pip \
    && pip install --no-cache-dir .

# Copy project source
COPY backend_api/ .

EXPOSE 8000

CMD ["gunicorn", "backend_api.wsgi:application", "--bind", "0.0.0.0:8000"]
