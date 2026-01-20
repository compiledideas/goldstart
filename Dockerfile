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
# Copy Prisma Client from pnpm's virtual store
COPY --from=builder /app/node_modules/.pnpm/@prisma*/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Create directories with proper permissions
RUN mkdir -p /app/uploads /app/.next/cache && \
    chown -R nextjs:nodejs /app/uploads /app/.next

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
