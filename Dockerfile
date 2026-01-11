FROM node:20-alpine AS base

# Install build dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Install dependencies
FROM base AS deps
WORKDIR /app

# Copy package files ONLY - no workspace file to avoid ignoredBuiltDependencies
COPY package.json pnpm-lock.yaml* ./

# Remove workspace file if it was somehow copied
RUN rm -f pnpm-workspace.yaml

# Install dependencies
RUN corepack enable pnpm && pnpm install --frozen-lockfile=false

# Rebuild better-sqlite3 for Alpine Linux
RUN for dir in node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3; do \
      if [ -d "$dir" ]; then \
        echo "Building better-sqlite3 in $dir" && \
        cd "$dir" && \
        npm run build-rebuild && \
        break; \
      fi; \
    done || echo "Build completed with warnings"

# Build the application
FROM base AS builder
WORKDIR /app

# Remove workspace file to ensure native modules aren't ignored
RUN rm -f pnpm-workspace.yaml

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Remove workspace file again if it was copied
RUN rm -f pnpm-workspace.yaml

# Verify better-sqlite3 bindings exist
RUN ls -la node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3/build/ 2>/dev/null || \
    (cd node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3 && npm run build-rebuild)

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PRIVATE_SKIP_BUILD_CONTEXT_GLOB=1

RUN corepack enable pnpm && pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules

# Create directories with proper permissions
RUN mkdir -p /app/uploads /app/data && \
    chown -R nextjs:nodejs /app/uploads /app/data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
