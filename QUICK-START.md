# 🚀 Démarrage Rapide - Campus Manager

## ⚡ Installation Ultra-Rapide

### Étape 1 : Vérifier que vous êtes dans le bon répertoire

```bash
# Assurez-vous d'être dans le dossier du projet
cd /chemin/vers/manager_academi
ls -la  # Vous devez voir : docker-compose.yml, Dockerfile.backend, etc.
```

### Étape 2 : Utiliser docker-compose.yml (Recommandé)

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

**C'est tout ! Accédez à : http://localhost**

---

## 🔧 Si vous avez déjà essayé docker-compose.prod.yml

### Nettoyer d'abord :

```bash
# Arrêter tous les conteneurs
docker-compose -f docker-compose.prod.yml down

# Nettoyer les images (optionnel)
docker-compose down
```

### Puis utiliser le docker-compose.yml normal :

```bash
docker-compose up -d
```

---

## 📊 Vérifier que tout fonctionne

### 1. État des services

```bash
docker-compose ps
```

Vous devriez voir :
```
NAME               STATUS              PORTS
campus-backend     Up (healthy)        0.0.0.0:8001->8001/tcp
campus-frontend    Up                  0.0.0.0:80->80/tcp
campus-mongodb     Up (healthy)        0.0.0.0:27017->27017/tcp
```

### 2. Tester le backend

```bash
curl http://localhost:8001/api/
```

Réponse attendue :
```json
{"message":"Hello World"}
```

### 3. Tester le frontend

Ouvrir dans le navigateur : **http://localhost**

Vous devriez voir la page de connexion Campus Manager.

---

## 🔍 Commandes Utiles

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Redémarrer un service

```bash
docker-compose restart backend
docker-compose restart frontend
```

### Arrêter tout

```bash
docker-compose down
```

### Supprimer tout (y compris les données)

```bash
docker-compose down -v
```

---

## 🐛 Problèmes Courants et Solutions

### ❌ Port 80 déjà utilisé

**Erreur :** `Bind for 0.0.0.0:80 failed: port is already allocated`

**Solution :**
```bash
# Option 1 : Arrêter le service qui utilise le port 80
sudo lsof -i :80
sudo systemctl stop nginx  # ou apache2

# Option 2 : Changer le port dans docker-compose.yml
# Modifier la ligne : "80:80" en "8080:80"
# Puis accéder via http://localhost:8080
```

### ❌ Variables d'environnement manquantes

**Erreur :** `The "MONGO_ROOT_USER" variable is not set`

**Solution :** Utilisez `docker-compose.yml` au lieu de `docker-compose.prod.yml`

```bash
docker-compose up -d
```

Pour la production, créez d'abord le fichier `.env` :
```bash
cp .env.docker.example .env
nano .env  # Éditer les valeurs
```

### ❌ Le frontend ne se charge pas

**Solution :**
```bash
# Rebuild le frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Vérifier les logs
docker-compose logs frontend
```

### ❌ Le backend ne se connecte pas à MongoDB

**Solution :**
```bash
# Attendre que MongoDB soit prêt
docker-compose logs mongodb | grep "Waiting for connections"

# Redémarrer le backend
docker-compose restart backend
```

---

## 📦 Architecture Simple

```
Frontend (React + Nginx)
    ↓ Port 80
http://localhost
    ↓
    ↓ /api/ → Proxy vers Backend
    ↓
Backend (FastAPI)
    ↓ Port 8001
http://localhost:8001
    ↓
    ↓ Connexion MongoDB
    ↓
MongoDB
    ↓ Port 27017
localhost:27017
```

---

## ✅ Checklist de Démarrage

- [ ] Docker et Docker Compose installés
- [ ] Dans le bon répertoire du projet
- [ ] Port 80 disponible
- [ ] Lancer `docker-compose up -d`
- [ ] Vérifier avec `docker-compose ps`
- [ ] Tester le backend : `curl http://localhost:8001/api/`
- [ ] Ouvrir le navigateur : http://localhost

---

## 🎯 Prochaines Étapes

1. **Créer un compte** : Aller sur http://localhost et s'inscrire
2. **Se connecter** : Utiliser vos identifiants
3. **Explorer** : Naviguer dans l'application

### Comptes de Test

Si vous voulez des données de test, vous pouvez créer :

**Admin :**
- Email : admin@campus.edu
- Mot de passe : Admin123!
- Rôle : Administrateur

**Enseignant :**
- Email : prof@campus.edu
- Mot de passe : Prof123!
- Rôle : Enseignant

**Étudiant :**
- Email : etudiant@campus.edu
- Mot de passe : Student123!
- Rôle : Étudiant

---

## 📞 Besoin d'aide ?

### Vérifier les logs pour diagnostiquer

```bash
# Logs du backend (problèmes d'API)
docker-compose logs backend

# Logs du frontend (problèmes d'affichage)
docker-compose logs frontend

# Logs MongoDB (problèmes de base de données)
docker-compose logs mongodb
```

### Reconstruire complètement

Si rien ne fonctionne :

```bash
# 1. Tout arrêter
docker-compose down -v

# 2. Nettoyer les images
docker system prune -a

# 3. Rebuild
docker-compose build --no-cache

# 4. Redémarrer
docker-compose up -d
```

---

**Bon développement ! 🎓**
