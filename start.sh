#!/bin/bash

# Script de démarrage automatique - Campus Manager
# Ce script configure et démarre automatiquement l'application

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   Campus Manager - Auto Start          ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Fonction pour afficher avec style
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé"
    echo "Installez Docker depuis : https://docs.docker.com/get-docker/"
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    error "Docker Compose n'est pas installé"
    echo "Installez Docker Compose depuis : https://docs.docker.com/compose/install/"
    exit 1
fi

success "Docker et Docker Compose sont installés"

# Vérifier les fichiers nécessaires
info "Vérification des fichiers..."

if [ ! -f "docker-compose.yml" ]; then
    error "docker-compose.yml non trouvé"
    exit 1
fi

if [ ! -f "Dockerfile.backend" ]; then
    error "Dockerfile.backend non trouvé"
    exit 1
fi

if [ ! -f "Dockerfile.frontend" ]; then
    error "Dockerfile.frontend non trouvé"
    exit 1
fi

success "Tous les fichiers nécessaires sont présents"

# Copier nginx.conf dans frontend si nécessaire
if [ ! -f "frontend/nginx.conf" ] && [ -f "nginx.conf" ]; then
    info "Copie de nginx.conf dans frontend/..."
    cp nginx.conf frontend/nginx.conf
    success "nginx.conf copié"
fi

# Vérifier si des conteneurs existent déjà
if docker-compose ps | grep -q "campus"; then
    warning "Des conteneurs Campus Manager existent déjà"
    read -p "Voulez-vous les redémarrer ? (o/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        info "Redémarrage des conteneurs..."
        docker-compose restart
        success "Conteneurs redémarrés"
    fi
else
    # Nettoyer d'abord si nécessaire
    info "Nettoyage des anciens conteneurs..."
    docker-compose down 2>/dev/null || true

    # Construire les images
    info "Construction des images Docker..."
    echo "Cela peut prendre quelques minutes..."
    
    if docker-compose build --no-cache; then
        success "Images construites avec succès"
    else
        error "Erreur lors de la construction"
        exit 1
    fi

    # Démarrer les services
    info "Démarrage des services..."
    
    if docker-compose up -d; then
        success "Services démarrés"
    else
        error "Erreur lors du démarrage"
        exit 1
    fi
fi

# Attendre que les services soient prêts
info "Attente du démarrage complet..."
sleep 5

# Vérifier l'état
info "Vérification de l'état des services..."
docker-compose ps

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Démarrage terminé avec succès !     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Tester le backend
info "Test du backend..."
sleep 2
if curl -s http://localhost:8001/api/ | grep -q "Hello World"; then
    success "Backend fonctionnel"
else
    warning "Backend ne répond pas encore (normal au premier démarrage)"
    info "Attendez 30 secondes et réessayez"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}🌐 Application disponible :${NC}"
echo ""
echo -e "   Frontend : ${BLUE}http://localhost${NC}"
echo -e "   Backend  : ${BLUE}http://localhost:8001${NC}"
echo -e "   MongoDB  : ${BLUE}localhost:27017${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════${NC}"
echo ""

# Afficher les commandes utiles
echo -e "${YELLOW}📋 Commandes utiles :${NC}"
echo ""
echo "   Voir les logs          : docker-compose logs -f"
echo "   Arrêter               : docker-compose down"
echo "   Redémarrer            : docker-compose restart"
echo "   État des services     : docker-compose ps"
echo ""

# Proposer d'ouvrir le navigateur
read -p "Voulez-vous ouvrir l'application dans le navigateur ? (o/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost
    elif command -v open &> /dev/null; then
        open http://localhost
    else
        info "Ouvrez manuellement : http://localhost"
    fi
fi

echo ""
info "Pour voir les logs en temps réel : docker-compose logs -f"
echo ""
