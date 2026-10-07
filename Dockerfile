# Etapa 1: build de producción
FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inserta la URL en el bundle durante el build, no en tiempo de ejecución
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN test -n "$VITE_API_URL" || (echo "Falta el build arg VITE_API_URL" && exit 1)
RUN npm run build

# Etapa 2: servidor de archivos estáticos
FROM caddy:2-alpine

COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

EXPOSE 80
