FROM node:20-alpine AS base

# Install build dependencies
RUN apk add --no-cache libc6-compat

# Install dependencies
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile=false

# Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment from .env for build
# Dockploy will pass these at build time via build args
ARG DATABASE_URL=mysql://user:password@localhost:3306/database
ARG BETTER_AUTH_SECRET=HdD1SdgDw1CgQA782nsxn8BZN3Bf9DHmjUJ85zECulM=
ARG BETTER_AUTH_URL=http://localhost:3000

ENV DATABASE_URL=${DATABASE_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}

# Generate Prisma Client in builder stage with schema available
RUN corepack enable pnpm && pnpm prisma generate

ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable pnpm && pnpm build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Environment variables - defaults for build, overridden at runtime by Dockploy
# Dockploy will inject runtime values via its environment variable configuration
ENV DATABASE_URL=${DATABASE_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV UPLOAD_DIR=/app/uploads

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy package files and Prisma schema
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/prisma ./prisma

# Install all dependencies including Prisma CLI for runtime migrations
RUN corepack enable pnpm && \
    pnpm install --frozen-lockfile=false && \
    pnpm prisma generate

# Create startup script with timeout and better error handling
RUN echo '#!/bin/sh' > /app/docker-entrypoint.sh && \
    echo 'set -e' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Extract MySQL host from DATABASE_URL' >> /app/docker-entrypoint.sh && \
    echo 'MYSQL_HOST=$(echo "$DATABASE_URL" | sed -n "s/.*@\([^:]*\):.*/\1/p")' >> /app/docker-entrypoint.sh && \
    echo 'MYSQL_PORT=$(echo "$DATABASE_URL" | sed -n "s/.*:\([0-9]*\)\/.*/\1/p")' >> /app/docker-entrypoint.sh && \
    echo 'echo "Database host: $MYSQL_HOST, port: ${MYSQL_PORT:-3306}"' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Wait for MySQL to be ready with timeout (max 60 retries = 5 minutes)' >> /app/docker-entrypoint.sh && \
    echo 'echo "Waiting for MySQL to be ready..."' >> /app/docker-entrypoint.sh && \
    echo 'RETRIES=0' >> /app/docker-entrypoint.sh && \
    echo 'MAX_RETRIES=60' >> /app/docker-entrypoint.sh && \
    echo 'while [ $RETRIES -lt $MAX_RETRIES ]; do' >> /app/docker-entrypoint.sh && \
    echo '  if npx prisma db push --skip-generate --accept-data-loss 2>&1; then' >> /app/docker-entrypoint.sh && \
    echo '    echo "MySQL is ready!"' >> /app/docker-entrypoint.sh && \
    echo '    break' >> /app/docker-entrypoint.sh && \
    echo '  fi' >> /app/docker-entrypoint.sh && \
    echo '  RETRIES=$((RETRIES + 1))' >> /app/docker-entrypoint.sh && \
    echo '  echo "Attempt $RETRIES/$MAX_RETRIES: MySQL not ready, waiting 5s..."' >> /app/docker-entrypoint.sh && \
    echo '  sleep 5' >> /app/docker-entrypoint.sh && \
    echo 'done' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Exit if MySQL never became ready' >> /app/docker-entrypoint.sh && \
    echo 'if [ $RETRIES -eq $MAX_RETRIES ]; then' >> /app/docker-entrypoint.sh && \
    echo '  echo "ERROR: MySQL did not become ready after $MAX_RETRIES attempts" >&2' >> /app/docker-entrypoint.sh && \
    echo '  echo "DATABASE_URL=$DATABASE_URL" >&2' >> /app/docker-entrypoint.sh && \
    echo '  exit 1' >> /app/docker-entrypoint.sh && \
    echo 'fi' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo 'echo "Starting Next.js server..."' >> /app/docker-entrypoint.sh && \
    echo 'exec node server.js' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

# Create directories with proper permissions
RUN mkdir -p /app/uploads /app/.next/cache && \
    chown -R nextjs:nodejs /app/uploads /app/.next /app/node_modules /app/prisma /app/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["/app/docker-entrypoint.sh"]
