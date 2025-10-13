#!/bin/bash

# Script de validation de la configuration Docker
echo "🔍 Validation de la configuration Docker pour Campus Manager"
echo "============================================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
ERRORS=0
WARNINGS=0
SUCCESS=0

# Fonction de vérification
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 existe"
        ((SUCCESS++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 manquant"
        ((ERRORS++))
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} Répertoire $1 existe"
        ((SUCCESS++))
        return 0
    else
        echo -e "${RED}✗${NC} Répertoire $1 manquant"
        ((ERRORS++))
        return 1
    fi
}

# Vérifier la structure
echo "📁 Vérification de la structure du projet..."
echo "--------------------------------------------"

check_dir "backend"
check_dir "frontend"
check_dir "frontend/src"
check_dir "frontend/public"

echo ""
echo "📄 Vérification des fichiers Docker..."
echo "--------------------------------------------"

check_file "Dockerfile.backend"
check_file "Dockerfile.frontend"
check_file "docker-compose.yml"
check_file "docker-compose.prod.yml"
check_file "nginx.conf"
check_file ".dockerignore"

echo ""
echo "🔧 Vérification des fichiers de configuration..."
echo "--------------------------------------------"

check_file "backend/server.py"
check_file "backend/requirements.txt"
check_file "backend/.env"
check_file "frontend/package.json"
check_file "frontend/yarn.lock"

echo ""
echo "📝 Vérification du contenu des Dockerfiles..."
echo "--------------------------------------------"

# Vérifier Dockerfile.backend
if grep -q "FROM python:3.11-slim" Dockerfile.backend; then
    echo -e "${GREEN}✓${NC} Dockerfile.backend : Image de base correcte"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} Dockerfile.backend : Image de base incorrecte"
    ((ERRORS++))
fi

if grep -q "uvicorn server:app" Dockerfile.backend; then
    echo -e "${GREEN}✓${NC} Dockerfile.backend : Commande uvicorn présente"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} Dockerfile.backend : Commande uvicorn manquante"
    ((ERRORS++))
fi

# Vérifier Dockerfile.frontend
if grep -q "FROM node:18-alpine AS builder" Dockerfile.frontend; then
    echo -e "${GREEN}✓${NC} Dockerfile.frontend : Image de base correcte"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} Dockerfile.frontend : Image de base incorrecte"
    ((ERRORS++))
fi

if grep -q "FROM nginx:alpine" Dockerfile.frontend; then
    echo -e "${GREEN}✓${NC} Dockerfile.frontend : Multi-stage build configuré"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} Dockerfile.frontend : Multi-stage build manquant"
    ((ERRORS++))
fi

echo ""
echo "🐳 Vérification de docker-compose.yml..."
echo "--------------------------------------------"

if grep -q "mongodb:" docker-compose.yml; then
    echo -e "${GREEN}✓${NC} Service MongoDB défini"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} Service MongoDB manquant"
    ((ERRORS++))
fi

if grep -q "backend:" docker-compose.yml; then
    echo -e "${GREEN}✓${NC} Service Backend défini"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} Service Backend manquant"
    ((ERRORS++))
fi

if grep -q "frontend:" docker-compose.yml; then
    echo -e "${GREEN}✓${NC} Service Frontend défini"
    ((SUCCESS++))
else
    echo -e "${RED}✗${NC} Service Frontend manquant"
    ((ERRORS++))
fi

# Vérifier les ports
if grep -q "27017:27017" docker-compose.yml; then
    echo -e "${GREEN}✓${NC} Port MongoDB (27017) configuré"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠${NC} Port MongoDB pourrait être manquant"
    ((WARNINGS++))
fi

if grep -q "8001:8001" docker-compose.yml; then
    echo -e "${GREEN}✓${NC} Port Backend (8001) configuré"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠${NC} Port Backend pourrait être manquant"
    ((WARNINGS++))
fi

if grep -q "80:80" docker-compose.yml; then
    echo -e "${GREEN}✓${NC} Port Frontend (80) configuré"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠${NC} Port Frontend pourrait être manquant"
    ((WARNINGS++))
fi

echo ""
echo "🔒 Vérification de la sécurité..."
echo "--------------------------------------------"

if [ -f ".env.docker.example" ]; then
    echo -e "${GREEN}✓${NC} Fichier .env.docker.example présent"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠${NC} Fichier .env.docker.example manquant"
    ((WARNINGS++))
fi

if grep -q ".env" .dockerignore 2>/dev/null; then
    echo -e "${GREEN}✓${NC} .env exclu du build Docker"
    ((SUCCESS++))
else
    echo -e "${YELLOW}⚠${NC} .env devrait être dans .dockerignore"
    ((WARNINGS++))
fi

echo ""
echo "📚 Vérification de la documentation..."
echo "--------------------------------------------"

check_file "README.Docker.md"
check_file "DEPLOYMENT.md"

echo ""
echo "============================================================"
echo "📊 RÉSULTATS"
echo "============================================================"
echo -e "${GREEN}Succès:${NC} $SUCCESS"
echo -e "${YELLOW}Avertissements:${NC} $WARNINGS"
echo -e "${RED}Erreurs:${NC} $ERRORS"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Configuration Docker valide !${NC}"
    echo ""
    echo "🚀 Prochaines étapes :"
    echo "   1. docker-compose up -d"
    echo "   2. Accéder à http://localhost"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Des erreurs ont été détectées.${NC}"
    echo "   Veuillez corriger les erreurs ci-dessus."
    echo ""
    exit 1
fi
