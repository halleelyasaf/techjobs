.PHONY: help build up down restart logs status clean dev dev-up dev-down dev-logs dev-backend dev-frontend

# Load .env file if it exists
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# Default target
help:
	@echo "TechJobs - Container Management"
	@echo "================================"
	@echo ""
	@echo "Production:"
	@echo "  make build       - Build production images"
	@echo "  make up          - Start production services"
	@echo "  make down        - Stop production services"
	@echo "  make restart     - Restart production services"
	@echo "  make logs        - View production logs"
	@echo "  make status      - Show container status"
	@echo "  make clean       - Remove all containers and images"
	@echo ""
	@echo "Development (with hot reload):"
	@echo "  make dev-up      - Start dev containers (code syncs automatically)"
	@echo "  make dev-down    - Stop dev containers"
	@echo "  make dev-logs    - View dev logs"
	@echo "  make dev-build   - Rebuild dev containers"
	@echo ""
	@echo "Development (local, no containers):"
	@echo "  make dev-backend   - Run backend locally"
	@echo "  make dev-frontend  - Run frontend locally"
	@echo ""

# ============================================
# Production commands
# ============================================

build:
	@echo "📦 Building production containers..."
	podman-compose build
	@echo "✅ Build complete!"

up:
	@echo "🚀 Starting TechJobs (production)..."
	podman-compose up -d
	@echo ""
	@echo "✅ TechJobs is running!"
	@echo "   Frontend: http://localhost:8080"
	@echo "   Backend:  http://localhost:3001"

down:
	@echo "🛑 Stopping TechJobs..."
	podman-compose down
	@echo "✅ Stopped!"

restart:
	@echo "🔄 Restarting TechJobs..."
	podman-compose restart
	@echo "✅ Restarted!"

logs:
	podman-compose logs -f

status:
	@echo "📊 Container Status:"
	podman-compose ps

clean:
	@echo "🧹 Cleaning up everything..."
	podman-compose -f podman-compose.yml -f podman-compose.dev.yml down -v --rmi all 2>/dev/null || true
	@echo "✅ Cleanup complete!"

# ============================================
# Development commands (containers with hot reload)
# ============================================

dev-build:
	@echo "📦 Building dev containers..."
	podman-compose -f podman-compose.yml -f podman-compose.dev.yml build
	@echo "✅ Dev build complete!"

dev-up:
	@echo "🔧 Starting TechJobs (development with hot reload)..."
	podman-compose -f podman-compose.yml -f podman-compose.dev.yml up -d --force-recreate
	@echo ""
	@echo "✅ Development mode running!"
	@echo "   Frontend: http://localhost:5173 (hot reload)"
	@echo "   Backend:  http://localhost:3001 (auto restart)"
	@echo ""
	@echo "📝 Edit files in ./frontend/src or ./backend/src"
	@echo "   Changes sync automatically!"

dev-down:
	@echo "🛑 Stopping dev containers..."
	podman-compose -f podman-compose.yml -f podman-compose.dev.yml down
	@echo "✅ Stopped!"

dev-logs:
	podman-compose -f podman-compose.yml -f podman-compose.dev.yml logs -f

# ============================================
# Development commands (local, no containers)
# ============================================

dev-backend:
	@echo "🔧 Starting backend locally..."
	cd backend && npm run dev

dev-frontend:
	@echo "🔧 Starting frontend locally..."
	cd frontend && npm run dev
