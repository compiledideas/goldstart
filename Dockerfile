FROM node:20-alpine AS base

# Install build dependencies
RUN apk add --no-cache libc6-compat

# Install dependencies
FROM base AS deps
WORKDIR /app

# Copy package files and Prisma schema (needed for postinstall hook)
COPY package.json pnpm-lock.yaml* prisma/ ./

# Install dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile=false

# Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment from .env for build
# Dockploy will pass these at build time via build args
ARG DATABASE_URL=mysql://mysql:zgTvQ6Ndx1VJTC3j1Wwk@217.182.205.50:3308/goldstart
ARG BETTER_AUTH_SECRET=HdD1SdgDw1CgQA782nsxn8BZN3Bf9DHmjUJ85zECulM=
ARG BETTER_AUTH_URL=https://goldstart.app

ENV DATABASE_URL=${DATABASE_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}

# Generate Prisma Client in builder stage with schema available
RUN corepack enable pnpm && pnpm prisma generate

ENV NEXT_TELEMETRY_DISABLED=1

# Clean any cached Next.js artifacts to ensure fresh build
RUN rm -rf .next

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

# Create startup script
RUN echo '#!/bin/sh' > /app/docker-entrypoint.sh && \
    echo 'set -e' >> /app/docker-entrypoint.sh && \
    echo '' >> /app/docker-entrypoint.sh && \
    echo '# Run database migrations' >> /app/docker-entrypoint.sh && \
    echo 'echo "Running Prisma db push..."' >> /app/docker-entrypoint.sh && \
    echo 'npx prisma db push --skip-generate --accept-data-loss' >> /app/docker-entrypoint.sh && \
    echo 'echo "Starting Next.js server..."' >> /app/docker-entrypoint.sh && \
    echo 'exec node server.js' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

# Create directories with proper permissions
RUN mkdir -p /app/uploads /app/.next/cache && \
    chown -R nextjs:nodejs /app/uploads /app/.next /app/node_modules /app/prisma /app/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3012
ENV HOSTNAME=0.0.0.0

CMD ["/app/docker-entrypoint.sh"]
