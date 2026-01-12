FROM node:20-alpine AS base

# Install build dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++ sqlite

# Install dependencies
FROM base AS deps
WORKDIR /app

# Copy package files ONLY - no workspace file
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile=false

# Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Rebuild better-sqlite3 for Alpine (builder stage starts fresh)
RUN cd node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3 && \
    npm run build-release

# Initialize database for build-time static generation
# Set DATABASE_PATH so the app finds the database during build
ENV DATABASE_PATH=/app/phone-repair.db
RUN mkdir -p /app/data && \
    sqlite3 /app/phone-repair.db < setup-db.sql

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_PATH=/app/phone-repair.db

RUN corepack enable pnpm && pnpm build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_PATH=/app/data/phone-repair.db

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/setup-db.sql ./setup-db.sql

# Create directories with proper permissions
RUN mkdir -p /app/uploads /app/data && \
    chown -R nextjs:nodejs /app/uploads /app/data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
