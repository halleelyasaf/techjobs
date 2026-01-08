# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    # Rebuild better-sqlite3 for the current platform
    npm rebuild better-sqlite3 && \
    # Clean up build dependencies
    apk del python3 make g++ && \
    rm -rf /root/.npm /tmp/*

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create data directory for SQLite database
RUN mkdir -p /app/data && chown -R node:node /app/data

# Use non-root user
USER node

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/app/data/techjobs.db

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the server
CMD ["node", "dist/index.js"]
