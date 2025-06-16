# Base stage
FROM node:22.2.0-alpine3.19 AS base

WORKDIR /usr/src/app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Development stage
FROM base AS development

COPY package*.json ./
RUN npm ci

COPY --chown=appuser:appgroup . .

RUN npm run build

# Production stage
FROM base AS production

# Set secure environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV} \
  PORT=3000 \
  TZ=UTC \
  NODE_OPTIONS="--max-http-header-size=16384 --max-old-space-size=2048" \
  NPM_CONFIG_LOGLEVEL=warn

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && \
  npm cache clean --force && \
  rm -rf /tmp/*

COPY --from=development --chown=appuser:appgroup /usr/src/app/dist ./dist

RUN rm -rf /usr/src/app/.git* && \
  rm -rf /usr/src/app/.npm* && \
  rm -f /usr/src/app/npm-debug.log

RUN chown -R appuser:appgroup /usr/src/app && \
  chmod -R 755 /usr/src/app

USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/health || exit 1

# Add container metadata
LABEL org.opencontainers.image.vendor="AndeanWide" \
  org.opencontainers.image.title="AW Payments Payouts Service" \
  org.opencontainers.image.description="Payments and Payouts Service for AndeanWide" \
  org.opencontainers.image.created="$(date -u "%Y-%m-%dT%H:%M:%SZ")" \
  org.opencontainers.image.version="1.0" \
  org.opencontainers.image.source="https://github.com/andeanwide/aw-payments-service"

EXPOSE ${PORT}

CMD ["node", "dist/main"]