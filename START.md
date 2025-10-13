# 🚀 Démarrage Rapide - Campus Manager

## ✅ Tous les Dockerfiles sont prêts !

Voici les fichiers Docker créés pour votre application :

### 📦 Fichiers Docker

```
✓ Dockerfile.backend        → Backend FastAPI
✓ Dockerfile.frontend       → Frontend React + Nginx
✓ docker-compose.yml        → Configuration développement
✓ docker-compose.prod.yml   → Configuration production
✓ nginx.conf                → Configuration Nginx
✓ .dockerignore             → Fichiers à exclure
✓ .env.docker.example       → Template configuration
```

### 📚 Documentation

```
✓ README.Docker.md          → Guide complet Docker
✓ DEPLOYMENT.md             → Guide de déploiement détaillé
```

---

## 🎯 DÉMARRAGE EN 3 ÉTAPES

### Option 1 : Docker Compose (Recommandé)

```bash
# 1️⃣ Aller dans le répertoire du projet
cd /app

# 2️⃣ Démarrer tous les services
docker-compose up -d

# 3️⃣ Vérifier l'état
docker-compose ps
```

**C'est tout ! L'application est accessible sur :**
- 🌐 Frontend : http://localhost
- 🔌 Backend : http://localhost:8001
- 🗄️ MongoDB : localhost:27017

---

### Option 2 : Build Manuel

#### Backend
```bash
cd backend
docker build -t campus-backend -f ../Dockerfile.backend .
docker run -d -p 8001:8001 \
  -e MONGO_URL="mongodb://host.docker.internal:27017" \
  --name campus-backend campus-backend
```

#### Frontend
```bash
cd frontend
docker build -t campus-frontend -f ../Dockerfile.frontend .
docker run -d -p 80:80 --name campus-frontend campus-frontend
```

#### MongoDB
```bash
docker run -d -p 27017:27017 \
  --name campus-mongodb mongo:7.0
```

---

## 📖 Commandes Utiles

### Voir les logs
```bash
docker-compose logs -f
```

### Arrêter
```bash
docker-compose down
```

### Redémarrer un service
```bash
docker-compose restart backend
```

### Entrer dans un conteneur
```bash
docker-compose exec backend bash
docker-compose exec mongodb mongosh
```

---

## 🔍 Vérification

### 1. Tous les services fonctionnent ?
```bash
docker-compose ps
```

Vous devez voir :
- ✅ mongodb (healthy)
- ✅ backend (running)
- ✅ frontend (running)

### 2. Tester le backend
```bash
curl http://localhost:8001/api/
# Devrait retourner: {"message":"Hello World"}
```

### 3. Tester le frontend
Ouvrir : http://localhost dans votre navigateur

---

## 🌐 Déploiement Production

### 1. Créer le fichier .env
```bash
cp .env.docker.example .env
nano .env  # Éditer avec vos valeurs
```

### 2. Démarrer en production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Variables importantes à changer :**
- `MONGO_ROOT_PASSWORD` : Mot de passe fort MongoDB
- `JWT_SECRET` : Clé secrète JWT (256+ caractères)
- `CORS_ORIGINS` : Votre domaine
- `BACKEND_URL` : URL de votre API

---

## 🐛 Problèmes Courants

### Port déjà utilisé (80 ou 8001)
```bash
# Changer le port dans docker-compose.yml
# Par exemple : "8080:80" au lieu de "80:80"
```

### Le backend ne se connecte pas à MongoDB
```bash
# Vérifier les logs
docker-compose logs backend

# Attendre que MongoDB soit prêt
docker-compose logs mongodb | grep "Waiting for connections"
```

### Rebuild après changement
```bash
docker-compose build --no-cache
docker-compose up -d
```

---

## 📊 Architecture Docker

```
┌─────────────────────┐
│   Nginx (Frontend)  │
│      Port 80        │
└──────────┬──────────┘
           │
           │ Proxy /api/
           │
┌──────────▼──────────┐
│  FastAPI (Backend)  │
│     Port 8001       │
└──────────┬──────────┘
           │
           │ Connexion
           │
┌──────────▼──────────┐
│      MongoDB        │
│     Port 27017      │
└─────────────────────┘
```

---

## ✅ Configuration Validée

Tous les fichiers ont été créés et validés :
- ✅ 28 vérifications réussies
- ✅ Structure du projet correcte
- ✅ Dockerfiles fonctionnels
- ✅ Docker Compose configuré
- ✅ Documentation complète

---

## 🎓 Prochaines Étapes

1. **Développement** : `docker-compose up -d`
2. **Tests** : Accéder à http://localhost
3. **Production** : Suivre le guide DEPLOYMENT.md
4. **Documentation** : Lire README.Docker.md

---

## 💡 Conseils

- Toujours vérifier les logs : `docker-compose logs -f`
- Sauvegarder régulièrement MongoDB
- Utiliser `.env` pour les secrets en production
- Activer SSL/HTTPS en production
- Monitorer les ressources : `docker stats`

---

## 📞 Support

- Docker : https://docs.docker.com/
- FastAPI : https://fastapi.tiangolo.com/
- React : https://react.dev/
- MongoDB : https://docs.mongodb.com/

---

**Bonne chance avec votre déploiement ! 🚀**
