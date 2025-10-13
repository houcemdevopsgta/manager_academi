# Stage 1: Build de l'application React
FROM node:18-alpine AS builder

WORKDIR /app

# Copier package.json et yarn.lock
COPY package.json yarn.lock ./

# Installer les dépendances
RUN yarn install --frozen-lockfile

# Copier le code source
COPY . .

# Build de l'application
RUN yarn build

# Stage 2: Servir avec nginx
FROM nginx:alpine

# Copier le build depuis le stage précédent
COPY --from=builder /app/build /usr/share/nginx/html

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]