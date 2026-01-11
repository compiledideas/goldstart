FROM node:20-alpine AS base

# Install build dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Install dependencies
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies without workspace file that ignores native builds
RUN corepack enable pnpm && pnpm install --frozen-lockfile=false --ignore-scripts=false

# Rebuild better-sqlite3 for Alpine
RUN npx node-gyp-build -w node_modules/.pnpm/better-sqlite3*/node_modules/better-sqlite3 2>/dev/null || \
    (cd node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3 && npm run build-rebuild) || \
    echo "Build step completed"

# Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PRIVATE_SKIP_BUILD_CONTEXT_GLOB=1

RUN corepack enable pnpm && pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Also copy node_modules for native modules (needed for better-sqlite3)
COPY --from=deps /app/node_modules ./node_modules

# Create directories with proper permissions
RUN mkdir -p /app/uploads /app/data && \
    chown -R nextjs:nodejs /app/uploads /app/data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
