# voxio-admin - Vue 3 + Vite frontend
FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV VITE_API_BASE_URL=/api
RUN pnpm build

# Production - nginx
FROM nginx:alpine AS runner

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV API_HOST=localhost
ENV API_PORT=3000

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
