# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY packages/common/package.json packages/common/
COPY packages/server/package.json packages/server/

# Install dependencies
RUN npm ci

# Copy source
COPY packages/common/ packages/common/
COPY packages/server/ packages/server/

# Build common package first
RUN npm run build -w packages/common

# Build server
RUN npm run build -w packages/server

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY packages/common/package.json packages/common/
COPY packages/server/package.json packages/server/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files
COPY --from=builder /app/packages/common/dist packages/common/dist
COPY --from=builder /app/packages/server/dist packages/server/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 3001

CMD ["node", "packages/server/dist/index.js"]
