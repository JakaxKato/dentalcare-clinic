# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_URL
ARG VITE_MIDTRANS_CLIENT_KEY
ARG VITE_MIDTRANS_IS_PRODUCTION
ENV VITE_API_URL=$VITE_API_URL \
    VITE_MIDTRANS_CLIENT_KEY=$VITE_MIDTRANS_CLIENT_KEY \
    VITE_MIDTRANS_IS_PRODUCTION=$VITE_MIDTRANS_IS_PRODUCTION

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Runtime stage (nginx) ----------
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
