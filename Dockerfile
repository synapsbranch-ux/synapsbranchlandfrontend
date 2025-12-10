# ============================================
# STAGE 1: Build the React application
# ============================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package.json ./

# Install dependencies with npm
# Use --legacy-peer-deps for React 19 compatibility
# Then install missing/required packages explicitly
RUN npm install --legacy-peer-deps && \
    npm install ajv@8 ajv-keywords@5 remark-gfm rehype-highlight --legacy-peer-deps

# Copy source code and config files
COPY . .

# Build the production app
ENV GENERATE_SOURCEMAP=false
ENV CI=false
ENV DISABLE_ESLINT_PLUGIN=true

# Build argument for backend URL (passed at build time)
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

RUN npm run build

# ============================================
# STAGE 2: Serve with nginx (much more reliable than serve)
# ============================================
FROM nginx:alpine AS production

# Copy custom nginx config for SPA routing
RUN rm /etc/nginx/conf.d/default.conf
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    listen [::]:80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing - serve index.html for all routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
EOF

# Copy built files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Railway uses PORT env variable - we need to replace nginx port dynamically
# Create entrypoint script
COPY <<EOF /docker-entrypoint.sh
#!/bin/sh
# Replace port 80 with Railway's PORT (default to 3000 if not set)
PORT=\${PORT:-3000}
sed -i "s/listen 80/listen \$PORT/g" /etc/nginx/conf.d/default.conf
sed -i "s/listen \[::\]:80/listen [::]:\$PORT/g" /etc/nginx/conf.d/default.conf
echo "Starting nginx on port \$PORT"
exec nginx -g "daemon off;"
EOF

RUN chmod +x /docker-entrypoint.sh

# Expose port (Railway will override with PORT env)
EXPOSE 3000

# Health check for Railway
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:\${PORT:-3000}/health || exit 1

# Start nginx
CMD ["/docker-entrypoint.sh"]
