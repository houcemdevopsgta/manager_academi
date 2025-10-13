# 🐳 Guide de Déploiement Docker - Campus Manager

## 📋 Prérequis

- Docker Engine 20.10+
- Docker Compose 2.0+
- 2 GB RAM minimum
- 10 GB espace disque

## 🚀 Démarrage Rapide (Développement)

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd campus-manager
```

### 2. Démarrer tous les services
```bash
docker-compose up -d
```

### 3. Accéder à l'application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8001
- **MongoDB**: localhost:27017

### 4. Voir les logs
```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### 5. Arrêter les services
```bash
docker-compose down

# Avec suppression des volumes
docker-compose down -v
```

## 🏭 Déploiement Production

### 1. Configuration des variables d'environnement
```bash
cp .env.docker.example .env
# Éditer .env avec vos valeurs de production
```

### 2. Démarrer en mode production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Configuration SSL (Recommandé)
```bash
# Créer le répertoire SSL
mkdir -p ssl

# Copier vos certificats
cp /path/to/cert.pem ssl/
cp /path/to/key.pem ssl/
```

## 🔧 Commandes Utiles

### Construire les images
```bash
# Tous les services
docker-compose build

# Service spécifique
docker-compose build backend
docker-compose build frontend
```

### Redémarrer un service
```bash
docker-compose restart backend
```

### Accéder au shell d'un conteneur
```bash
# Backend
docker-compose exec backend bash

# MongoDB
docker-compose exec mongodb mongosh
```

### Vérifier l'état des services
```bash
docker-compose ps
```

### Voir l'utilisation des ressources
```bash
docker stats
```

## 💾 Gestion de la Base de Données

### Backup manuel
```bash
# Créer un backup
docker-compose exec mongodb mongodump --out /data/backup

# Exporter le backup
docker cp campus-mongodb:/data/backup ./backup-$(date +%Y%m%d)
```

### Restore depuis backup
```bash
# Copier le backup dans le conteneur
docker cp ./backup-20240101 campus-mongodb:/data/restore

# Restaurer
docker-compose exec mongodb mongorestore /data/restore
```

### Accéder à MongoDB
```bash
# Ouvrir le shell MongoDB
docker-compose exec mongodb mongosh

# Dans mongosh
use campus_manager
show collections
db.users.find().pretty()
```

## 🔒 Sécurité

### Variables d'environnement sensibles
```bash
# Ne JAMAIS commiter .env
echo ".env" >> .gitignore

# Utiliser des secrets Docker en production
docker secret create jwt_secret jwt_secret.txt
```

### Mise à jour des images
```bash
# Pull des dernières images
docker-compose pull

# Rebuild et redémarrage
docker-compose up -d --build
```

## 📊 Monitoring

### Logs centralisés
```bash
# Suivre tous les logs
docker-compose logs -f --tail=100

# Logs d'un service avec timestamp
docker-compose logs -f -t backend
```

### Health checks
```bash
# Vérifier la santé des services
docker-compose ps

# Tester l'API backend
curl http://localhost:8001/api/

# Tester MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

## 🐛 Dépannage

### Le backend ne démarre pas
```bash
# Vérifier les logs
docker-compose logs backend

# Vérifier la connexion MongoDB
docker-compose exec backend ping mongodb
```

### Le frontend ne se charge pas
```bash
# Vérifier nginx
docker-compose exec frontend nginx -t

# Rebuild le frontend
docker-compose build --no-cache frontend
```

### Nettoyer l'environnement Docker
```bash
# Supprimer tous les conteneurs arrêtés
docker container prune

# Supprimer les images inutilisées
docker image prune -a

# Nettoyer complètement (ATTENTION: supprime tout)
docker system prune -a --volumes
```

## 📈 Scalabilité

### Scaling horizontal
```bash
# Augmenter le nombre d'instances backend
docker-compose up -d --scale backend=3
```

### Load balancer (avec Nginx)
```yaml
# Ajouter dans docker-compose.yml
loadbalancer:
  image: nginx:alpine
  volumes:
    - ./nginx-lb.conf:/etc/nginx/nginx.conf
  ports:
    - "80:80"
  depends_on:
    - backend
```

## 🎯 Bonnes Pratiques

1. **Toujours utiliser des versions spécifiques** des images (éviter `:latest`)
2. **Mettre en place des health checks** pour tous les services
3. **Limiter les ressources** (CPU, mémoire) en production
4. **Backup réguliers** de la base de données
5. **Monitoring** et alertes en production
6. **Logs rotatifs** pour éviter de saturer le disque
7. **Secrets management** avec Docker secrets ou vault

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)