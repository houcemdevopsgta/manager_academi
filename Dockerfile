# Dockerfile Principal (Multi-stage pour Backend + Frontend)
FROM python:3.11-slim AS backend-builder

WORKDIR /app/backend

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Frontend build stage
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY frontend/ .
RUN yarn build

# Stage final
FROM python:3.11-slim

WORKDIR /app

# Installer nginx pour servir le frontend
RUN apt-get update && apt-get install -y nginx supervisor curl && \
    rm -rf /var/lib/apt/lists/*

# Copier le backend
COPY --from=backend-builder /app/backend /app/backend
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

# Copier le frontend build
COPY --from=frontend-builder /app/frontend/build /var/www/html

# Configuration nginx
COPY nginx.conf /etc/nginx/sites-available/default

# Configuration supervisord
RUN echo '[supervisord]\n\
nodaemon=true\n\
\n\
[program:backend]\n\
command=uvicorn server:app --host 0.0.0.0 --port 8001\n\
directory=/app/backend\n\
autostart=true\n\
autorestart=true\n\
stdout_logfile=/var/log/supervisor/backend.log\n\
stderr_logfile=/var/log/supervisor/backend.err.log\n\
\n\
[program:nginx]\n\
command=/usr/sbin/nginx -g "daemon off;"\n\
autostart=true\n\
autorestart=true\n\
stdout_logfile=/var/log/supervisor/nginx.log\n\
stderr_logfile=/var/log/supervisor/nginx.err.log' > /etc/supervisor/conf.d/supervisord.conf

# Exposer les ports
EXPOSE 80 8001

# Variables d'environnement
ENV MONGO_URL="mongodb://mongodb:27017"
ENV DB_NAME="campus_manager"
ENV CORS_ORIGINS="*"
ENV JWT_SECRET="your-secret-key-change-in-production-2024"

# Commande de démarrage
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]