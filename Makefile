.PHONY: help \
        up up-build down restart build ps \
        logs logs-backend logs-frontend logs-db logs-redis \
        seed backend-shell \
        frontend-install frontend-dev frontend-build frontend-preview \
        dev-backend dev-frontend \
        setup health post open-docs open-blog \
        clean clean-images

.DEFAULT_GOAL := help

# ── Colours ────────────────────────────────────────────────────────────────────
CYAN  := \033[36m
BOLD  := \033[1m
RESET := \033[0m

# ── Help ───────────────────────────────────────────────────────────────────────

help: ## Show this help
	@echo ""
	@echo "$(BOLD)Personal Blog$(RESET)"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "}; \
	      /^##/ { printf "\n$(BOLD)%s$(RESET)\n", substr($$0, 4) } \
	      /^[a-zA-Z_-]+:.*?## / { printf "  $(CYAN)%-22s$(RESET) %s\n", $$1, $$2 }' \
	      $(MAKEFILE_LIST)
	@echo ""

# ── Docker Compose ─────────────────────────────────────────────────────────────

## Docker

up: ## Start all services in the background
	docker compose up -d

up-build: ## Rebuild images and start all services
	docker compose up -d --build

down: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose restart

build: ## Rebuild all Docker images without starting
	docker compose build

ps: ## Show status of running containers
	docker compose ps

## Logs

logs: ## Tail logs from all services
	docker compose logs -f

logs-backend: ## Tail backend logs only
	docker compose logs -f backend

logs-frontend: ## Tail frontend logs only
	docker compose logs -f frontend

logs-db: ## Tail PostgreSQL logs only
	docker compose logs -f db

logs-redis: ## Tail Redis logs only
	docker compose logs -f redis

## Database

seed: ## Seed the DB with 5 sample posts (run once after first up)
	docker compose exec backend python seed.py

backend-shell: ## Open a bash shell inside the running backend container
	docker compose exec backend /bin/bash

## Frontend (local)

frontend-install: ## Install frontend npm dependencies
	cd frontend && npm install

frontend-dev: ## Start Vite dev server locally (needs backend running separately)
	cd frontend && npm run dev

frontend-build: ## Build the frontend for production
	cd frontend && npm run build

frontend-preview: ## Build and preview the production bundle locally
	cd frontend && npm run build && npm run preview

## Local dev (no Docker)

dev-backend: ## Run FastAPI locally with auto-reload (needs Postgres + Redis running)
	cd backend/python && uvicorn app.main:app --reload --port 8000

dev-frontend: ## Run Vite dev server locally
	cd frontend && npm run dev

## Utilities

setup: frontend-install ## First-time setup: install frontend deps (assumes .env is already present)
	@test -f .env || (echo "  ERROR: .env not found at the project root. Create one before running setup." && exit 1)
	@echo ""
	@echo "  Done. Next steps:"
	@echo "    make up-build   — build images and start all services"
	@echo "    make seed       — populate sample blog posts"
	@echo "    make open-blog  — open the blog in your browser"
	@echo ""

health: ## Check the backend health endpoint
	@curl -s http://localhost:8001/health | python -m json.tool

post: ## Create a test post via the API (quick smoke test)
	@curl -s -X POST http://localhost:8001/api/posts \
		-H "Content-Type: application/json" \
		-d '{ \
			"title": "Hello from Makefile", \
			"excerpt": "A quick smoke-test post created via make post.", \
			"body": "# Hello\n\nThis post was created by running `make post`.\n\n## Code works too\n\n```python\nprint(\"hello, blog\")\n```", \
			"tags": ["test", "makefile"], \
			"category": "Misc", \
			"draft": false \
		}' | python -m json.tool

open-docs: ## Open the FastAPI interactive docs (Swagger UI)
	@cmd /c start http://localhost:8001/docs 2>nul || \
	 xdg-open http://localhost:8001/docs 2>/dev/null || \
	 open http://localhost:8001/docs

open-blog: ## Open the blog frontend in the browser
	@cmd /c start http://localhost:3001 2>nul || \
	 xdg-open http://localhost:3001 2>/dev/null || \
	 open http://localhost:3001

## Cleanup

clean: ## Stop containers and DELETE all data volumes
	@echo "  WARNING: this deletes the Postgres and Redis volumes."
	@echo "  Press Ctrl+C within 5 seconds to cancel..."
	@sleep 5
	docker compose down -v

clean-images: ## Remove project Docker images (forces a full rebuild next time)
	docker compose down --rmi local
