FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# We don't inject production secrets here. They should be handled at runtime or build time by CI.
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Use standard Nginx config
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
