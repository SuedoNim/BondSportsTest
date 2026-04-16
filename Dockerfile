# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy files
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

# Install and build
RUN npm ci
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Copy built app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Create data directory
RUN mkdir -p data && chown nodejs:nodejs data

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]