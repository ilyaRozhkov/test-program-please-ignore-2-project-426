# ---- Бэкенд ----
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
RUN apk add --no-cache openssl
COPY backend/package*.json ./
COPY backend/prisma ./prisma
RUN npm ci
COPY backend/ .
RUN npm run build

# ---- Фронтенд ----
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# ---- Финальный образ ----
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl

COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/prisma ./backend/prisma
COPY --from=backend-builder /app/backend/package.json ./backend/package.json

COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

WORKDIR /app/backend
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]