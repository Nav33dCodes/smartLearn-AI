# 1. Build stage: compile the React frontend
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# 2. Serve stage: use Nginx to serve the static built files
FROM nginx:alpine
# Copy built files from the previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create an Nginx config that handles React Router history push-state routing
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
