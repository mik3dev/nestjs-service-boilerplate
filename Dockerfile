# Base stage
FROM node:22.2.0-alpine3.19 AS base

WORKDIR /usr/src/app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Development stage
FROM base AS development

# Copy package files to detect package manager
COPY package*.json ./
COPY pnpm-lock.yaml* yarn.lock* package-lock.json* ./

# Setup the right package manager with install command
RUN if [ -f "yarn.lock" ]; then \
  echo "Using Yarn" && \
  npm install -g yarn && \
  yarn install --frozen-lockfile; \
  elif [ -f "pnpm-lock.yaml" ]; then \
  echo "Using pnpm" && \
  npm install -g pnpm && \
  pnpm install --frozen-lockfile; \
  else \
  echo "Using npm" && \
  npm ci; \
  fi

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
COPY pnpm-lock.yaml* yarn.lock* package-lock.json* ./

# Install dependencies with the appropriate package manager
RUN if [ -f "yarn.lock" ]; then \
  echo "Using Yarn for production" && \
  npm install -g yarn && \
  yarn install --production --frozen-lockfile && \
  yarn cache clean; \
  elif [ -f "pnpm-lock.yaml" ]; then \
  echo "Using pnpm for production" && \
  npm install -g pnpm && \
  pnpm install --prod && \
  pnpm store prune; \
  else \
  echo "Using npm for production" && \
  npm ci --only=production && \
  npm cache clean --force; \
  fi && \
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


EXPOSE ${PORT}

CMD ["node", "dist/main"]