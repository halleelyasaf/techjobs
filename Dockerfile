# Combined Dockerfile - Frontend served by Backend (no nginx)

# ============ Build Frontend ============
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ============ Build Backend ============
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend
RUN apk add --no-cache python3 make g++
COPY backend/package*.json ./
RUN npm ci
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

# ============ Production ============
FROM node:20-alpine

RUN apk add --no-cache python3 make g++
WORKDIR /app

# Backend dependencies
COPY backend/package*.json ./
RUN npm ci --only=production && npm rebuild better-sqlite3

# Clean build tools
RUN apk del python3 make g++ && rm -rf /root/.npm /tmp/*

# Copy backend build
COPY --from=backend-builder /app/backend/dist ./dist

# Copy frontend build to public folder
COPY --from=frontend-builder /app/frontend/dist ./public

# Create data directory
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV DB_PATH=/app/data/techjobs.db

EXPOSE 3001

CMD ["node", "dist/index.js"]
