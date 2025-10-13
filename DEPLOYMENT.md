# 🚀 Guide de Déploiement Campus Manager

## 📋 Structure du Projet

```
campus-manager/
├── backend/              # Backend FastAPI
│   ├── server.py
│   ├── requirements.txt
│   └── .env
├── frontend/            # Frontend React
│   ├── src/
│   ├── package.json
│   └── yarn.lock
├── Dockerfile.backend   # Dockerfile pour backend
├── Dockerfile.frontend  # Dockerfile pour frontend
├── nginx.conf          # Configuration Nginx
├── docker-compose.yml  # Dev
└── docker-compose.prod.yml  # Production
```

## 🐳 Méthode 1 : Docker Compose (Recommandé)

### Développement Local

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

**Accès :**
- Frontend : http://localhost
- Backend : http://localhost:8001
- MongoDB : localhost:27017

### Production

```bash
# 1. Créer le fichier .env
cp .env.docker.example .env
nano .env  # Modifier les valeurs

# 2. Démarrer en production
docker-compose -f docker-compose.prod.yml up -d

# 3. Vérifier l'état
docker-compose -f docker-compose.prod.yml ps

# 4. Voir les logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔧 Méthode 2 : Construire les Images Séparément

### Backend

```bash
# Depuis la racine du projet
cd backend
docker build -t campus-backend -f ../Dockerfile.backend .

# Lancer le conteneur
docker run -d \
  --name campus-backend \
  -p 8001:8001 \
  -e MONGO_URL="mongodb://mongodb:27017" \
  -e DB_NAME="campus_manager" \
  -e JWT_SECRET="your-secret-key" \
  campus-backend
```

### Frontend

```bash
# Depuis la racine du projet
cd frontend
docker build -t campus-frontend -f ../Dockerfile.frontend .

# Lancer le conteneur
docker run -d \
  --name campus-frontend \
  -p 80:80 \
  campus-frontend
```

### MongoDB

```bash
docker run -d \
  --name campus-mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7.0
```

## 🌐 Méthode 3 : Sans Docker (Développement Local)

### Backend

```bash
cd backend

# Créer environnement virtuel
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer dépendances
pip install -r requirements.txt

# Démarrer
uvicorn server:app --reload --port 8001
```

### Frontend

```bash
cd frontend

# Installer dépendances
yarn install

# Démarrer
yarn start
```

### MongoDB

```bash
# Avec Docker
docker run -d -p 27017:27017 mongo:7.0

# Ou installer MongoDB localement
# https://www.mongodb.com/docs/manual/installation/
```

## 📦 Commandes Docker Utiles

### Construire les images

```bash
# Backend seulement
docker-compose build backend

# Frontend seulement
docker-compose build frontend

# Tout rebuild
docker-compose build --no-cache
```

### Gestion des services

```bash
# Redémarrer un service
docker-compose restart backend

# Voir les logs d'un service
docker-compose logs -f frontend

# Entrer dans un conteneur
docker-compose exec backend bash
docker-compose exec mongodb mongosh
```

### Nettoyage

```bash
# Arrêter et supprimer
docker-compose down

# Avec les volumes
docker-compose down -v

# Nettoyer les images non utilisées
docker system prune -a
```

## 🔍 Vérification du Déploiement

### 1. Vérifier que tous les services sont UP

```bash
docker-compose ps
```

Vous devriez voir :
- ✅ mongodb (healthy)
- ✅ backend (healthy)
- ✅ frontend (up)

### 2. Tester le backend

```bash
curl http://localhost:8001/api/
# Devrait retourner: {"message":"Hello World"}
```

### 3. Tester le frontend

Ouvrir dans le navigateur : http://localhost

### 4. Vérifier MongoDB

```bash
docker-compose exec mongodb mongosh
# Dans mongosh:
show dbs
use campus_manager
show collections
```

## 🐛 Dépannage

### Le backend ne démarre pas

```bash
# Voir les logs
docker-compose logs backend

# Vérifier la connexion MongoDB
docker-compose exec backend ping mongodb

# Redémarrer
docker-compose restart backend
```

### Le frontend affiche une erreur 502

```bash
# Vérifier que le backend est UP
curl http://localhost:8001/api/

# Vérifier la config nginx
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Rebuild le frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### MongoDB n'est pas accessible

```bash
# Vérifier l'état
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Voir les logs
docker-compose logs mongodb

# Redémarrer
docker-compose restart mongodb
```

### Port déjà utilisé

```bash
# Trouver quel process utilise le port 80
sudo lsof -i :80

# Changer le port dans docker-compose.yml
# ports:
#   - "8080:80"  # Utiliser 8080 au lieu de 80
```

## 🔐 Configuration Production

### 1. Variables d'environnement

Créer `.env` :

```env
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=VotreMot2PasseSécurisé!
JWT_SECRET=clé-jwt-ultra-sécurisée-256-caractères
DB_NAME=campus_manager
CORS_ORIGINS=https://votredomaine.com
BACKEND_URL=https://api.votredomaine.com
```

### 2. SSL/HTTPS

```bash
# Créer le dossier SSL
mkdir ssl

# Copier vos certificats
cp /chemin/vers/cert.pem ssl/
cp /chemin/vers/key.pem ssl/

# Ou générer avec Let's Encrypt
certbot certonly --standalone -d votredomaine.com
```

### 3. Backup automatique

Le `docker-compose.prod.yml` inclut un service de backup :

```bash
# Vérifier les backups
ls -lh backups/

# Restaurer un backup
docker-compose exec mongodb mongorestore /backup/backup-20240101
```

## 📊 Monitoring

### Logs en temps réel

```bash
# Tous les services
docker-compose logs -f --tail=100

# Un service spécifique
docker-compose logs -f backend
```

### Ressources utilisées

```bash
# Stats en temps réel
docker stats

# Espace disque
docker system df
```

### Health checks

```bash
# Vérifier la santé
docker-compose ps

# Test manuel backend
curl -f http://localhost:8001/api/ || echo "Backend DOWN"

# Test MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')" || echo "MongoDB DOWN"
```

## 🎯 Checklist Déploiement Production

- [ ] Variables d'environnement configurées
- [ ] JWT_SECRET changé (256+ caractères)
- [ ] MongoDB avec mot de passe fort
- [ ] CORS_ORIGINS configuré avec votre domaine
- [ ] SSL/HTTPS configuré
- [ ] Backups automatiques activés
- [ ] Monitoring en place
- [ ] Limites de ressources définies
- [ ] Logs rotatifs configurés
- [ ] Firewall configuré
- [ ] Tests de charge effectués

## 📞 Support

Pour toute question :
- Documentation Docker : https://docs.docker.com/
- MongoDB : https://docs.mongodb.com/
- FastAPI : https://fastapi.tiangolo.com/
- React : https://react.dev/
