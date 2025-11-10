# -------- base deps stage --------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Use npm ci for clean, reproducible installs
RUN npm ci

# -------- build stage --------
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# -------- production stage --------
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY ./.env ./.env
EXPOSE 3000
CMD ["node", "dist/main.js"]

# Healthcheck (optionnel mais recommandé)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost:3000/health || exit 1
