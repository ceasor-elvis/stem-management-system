# stem-management-system

Management System for the STEM Bootcamp — a simple Django + React (Vite) application
for managing student check-ins, devices, and records used during the STEM program.

**This repository contains a Dockerized full-stack app**:

- `backend/` — Django REST Framework API
- `frontend/` — Vite + React frontend (TypeScript)
- `docker-compose.yaml` — development orchestration (Postgres, backend, frontend)

**Quick overview**

- Backend: Django 6.x, Django REST Framework, Token Authentication, Gunicorn
- Frontend: React + TypeScript, Vite, shadcn-ui + Tailwind CSS
- Database (dev with Docker Compose): PostgreSQL (service name `db`), media persisted in a `media` volume

**Project structure (top-level)**

- `backend/` — Django project and app(s)
- `frontend/` — React app built with Vite
- `docker-compose.yaml` — service definitions: `backend`, `frontend`, `db`

**Prerequisites**

- Docker & Docker Compose (recommended for development)
- Node.js >= 18 and npm (for frontend local dev)
- Python 3.12+ if you want to run the backend locally without Docker

**Quick start — using Docker Compose (recommended)**

1. Build and start all services:

```bash
docker compose up --build
```

2. The services will be available at:

- Backend (API): http://localhost:8000
- Frontend (client): http://localhost:8080
- Database (Postgres): port 5432 (container `db`)

3. Run Django migrations and create a superuser (execute inside the `backend` service):

```bash
docker compose exec backend python backend_api/manage.py migrate
docker compose exec backend python backend_api/manage.py createsuperuser
```

4. (Optional) If you need to collect static files or run other management commands, use the same pattern:

```bash
docker compose exec backend python backend_api/manage.py <command>
```

**Frontend — local development (without Docker)**

1. Change into the frontend folder:

```bash
cd frontend
npm install
```

2. Start the Vite development server (hot reload):

```bash
npm run dev
```

3. By default the frontend expects an API URL in the environment variable `VITE_API_URL`.
When using Docker Compose the environment variable is already set for the `frontend` service:

```yaml
environment:
  - VITE_API_URL=http://localhost:8000/api
```

To run the frontend locally against your backend, export `VITE_API_URL` before starting Vite:

```bash
export VITE_API_URL=http://localhost:8000/api
npm run dev
```

**Backend — local development (without Docker)**

1. Create a virtual environment and install dependencies. The project uses a `pyproject.toml`; adapt to your preferred tooling (pip, poetry):

```bash
# example with pip + virtualenv
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt  # if you have a requirements file
# or install packages listed in backend/pyproject.toml
```

2. Run migrations and start the Django dev server:

```bash
cd backend
python backend_api/manage.py migrate
python backend_api/manage.py runserver 0.0.0.0:8000
```

Note: The repository currently includes a `db.sqlite3` at `backend/backend_api/db.sqlite3` for quick local testing, however the Docker Compose setup uses PostgreSQL (see `docker-compose.yaml` and `backend/backend_api/backend_api/settings.py`).

**Configuration notes**

- Django settings use PostgreSQL with these credentials (used by Docker Compose):

  - NAME: `stem_db`
  - USER: `stem_user`
  - PASSWORD: `stem_pass`
  - HOST: `db`
  - PORT: `5432`

- Media files are stored in a Docker volume named `media` (mapped to `backend` at `/app/media`).
- CORS is configured to allow `http://localhost:8080` (frontend dev server) and `http://localhost:5173`.

**Running common tasks**

- To run the test suite (if tests exist) inside the backend container:

```bash
docker compose exec backend python backend_api/manage.py test
```

- To view running containers and logs:

```bash
docker compose ps
docker compose logs -f
```

**Development tips**

- Use Docker Compose for a consistent environment for other developers and CI.
- When changing backend models, remember to `makemigrations` and `migrate`:

```bash
docker compose exec backend python backend_api/manage.py makemigrations
docker compose exec backend python backend_api/manage.py migrate
```

**Contributing**

If you'd like to contribute:

- Open an issue to discuss larger changes.
- Fork the repo, create a feature branch, and open a pull request.

**Useful files**

- `docker-compose.yaml` — orchestration for local development
- `backend/` — Django project (API)
- `frontend/` — React + Vite client

**License & contact**

Add license information here (e.g., MIT) and contact/maintainer details.

---

If you'd like, I can also:

- Add a `requirements.txt` or `devcontainer.json` for easier onboarding
- Create simple scripts to run common Docker Compose commands
- Flesh out the `backend/README.md` and `frontend/README.md` with project-specific commands

Tell me which of those you'd like next.
# stem-management-system
Management System for the STEM Bootcamp
