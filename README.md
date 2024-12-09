# SportConnect

SportConnect est une plateforme innovante dédiée à l'organisation des rencontres sportives et des tournois, avec un suivi statistique avancé basé sur les évaluations des participants.

## Architecture

Le projet est divisé en trois parties principales :
- `mobile/` : Application mobile React Native (Expo)
- `web/` : Application web React
- `backend/` : Backend Supabase avec PostgreSQL
- `shared/` : Code partagé entre les différentes parties du projet

## Prérequis

- Node.js >= 16
- Docker
- Kubernetes (K3s)
- Expo CLI
- Supabase CLI

## Installation

1. Cloner le repository
```bash
git clone https://github.com/votre-username/sport-connect.git
cd sport-connect
```

2. Installation des dépendances
```bash
# Installation des dépendances web
cd web
npm install

# Installation des dépendances mobile
cd ../mobile
npm install

# Installation des dépendances backend
cd ../backend
npm install
```

3. Configuration de l'environnement
- Copier `.env.example` vers `.env` dans chaque dossier
- Configurer les variables d'environnement appropriées

## Développement

### Application Web
```bash
cd web
npm start
```

### Application Mobile
```bash
cd mobile
expo start
```

### Backend
```bash
cd backend
npm run dev
```

## Fonctionnalités principales

- Gestion des utilisateurs et des équipes
- Organisation des matchs et tournois
- Système de notation et statistiques
- Notifications en temps réel
- Mode sombre/clair
- Interface responsive

## Sécurité

- Authentification JWT via Supabase
- Certificats SSL (Let's Encrypt)
- Stockage sécurisé des données utilisateur

## Licence

MIT
