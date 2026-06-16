# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install only production-deterministic deps first for cache reuse
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# ---------- Runtime stage ----------
FROM node:20-alpine AS runtime
WORKDIR /app

# Non-root user for hardening
RUN addgroup -S app && adduser -S app -G app

ENV NODE_ENV=production \
    PORT=5000

COPY --from=build /app /app
RUN mkdir -p /app/uploads && chown -R app:app /app

USER app

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/api/health || exit 1

CMD ["node", "server.js"]
