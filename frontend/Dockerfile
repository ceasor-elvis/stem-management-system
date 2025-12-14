FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# Export build only
FROM alpine:3.19

WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
