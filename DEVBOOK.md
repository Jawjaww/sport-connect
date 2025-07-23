# DevBook pour SportConnect - Version Actualisée 2025

## 1. Introduction
### 1.1 Description du Projet
SportConnect est une application mobile multiplateforme (Android et iOS) dédiée à la gestion intelligente des équipes sportives. L'application combine gestion pratique, évaluations entre pairs, et intelligence artificielle pour optimiser les performances d'équipe.

### 1.2 Objectifs du MVP
- ✅ **Infrastructure robuste** : Backend Supabase avec sécurité enterprise
- ✅ **Gestion complète des équipes** : Création, invitation, rôles, matchs
- ✅ **Système d'évaluation avancé** : 5 dimensions avec calculs automatiques
- 🔄 **Interface utilisateur intuitive** : Design moderne avec React Native Paper
- 🤖 **Préparation IA** : Architecture complète pour features intelligentes futures

### 1.3 Innovation Clé
**IA ludique intégrée** : L'application est conçue pour évoluer vers un assistant virtuel qui analyse les performances, suggère des compositions optimales, et aide à la prise de décision sportive.

## 2. Technologies Utilisées
### 2.1 Technologies Principales
- **Expo SDK 52** : Dernière version avec React Native 0.76.3
- **TypeScript** : Langage typé pour réduire les bugs et améliorer la maintenance
- **Supabase** : Backend as a Service avec authentification, base de données PostgreSQL et Row Level Security
- **React Navigation** : Navigation native optimisée pour mobile
- **Expo Notifications** : Système de notifications push (remplace Firebase FCM)
- **SQLite** : Base de données locale avec API sync pour Expo SDK 52
- **React Native Paper** : Composants Material Design
- **Zod** : Validation de schémas TypeScript
- **Jest + Vitest** : Tests unitaires et d'intégration
- **Typedoc** : Documentation automatique du code

### 2.2 Architecture Backend
- **Supabase PostgreSQL** : Base de données principale avec RLS
- **Row Level Security** : Isolation complète des données par équipe
- **Triggers automatiques** : Calculs temps réel des statistiques
- **Schema versionné** : Migrations PostgreSQL avec rollback
- **API REST/GraphQL** : Générée automatiquement par Supabase

## 3. Structure de la Base de Données
> **📋 Schema Version** : `20250122_complete_optimized_schema.sql`  
> **📍 Localisation** : `mobile/supabase/migrations/`  
> **📚 Documentation** : `mobile/supabase/DATABASE_DOCUMENTATION.md`

### 3.1 Tables Principales (✅ Opérationnelles)
- **profiles** : Profils utilisateurs avec authentification Supabase
- **teams** : Équipes sportives avec codes d'invitation automatiques
- **team_members** : Relations utilisateurs/équipes avec rôles (`player`, `coach`, `manager`, `admin`)
- **matches** : Matchs avec scores, statuts temps réel et lien vers tournois
- **tournaments** : Organisation de tournois avec formats multiples
- **player_ratings** : Évaluations détaillées post-match (5 dimensions)
- **player_stats** : Statistiques auto-calculées avec triggers
- **notifications** : Système de notifications étendu

### 3.2 Tables IA (🤖 Future-Ready)
- **ai_insights** : Insights automatiques (tendances, recommandations)
- **player_chemistry** : Analyse de compatibilité entre joueurs
- **match_participation_patterns** : Patterns comportementaux pour sélection
- **ai_selection_history** : Historique des sélections automatiques
- **feedback_sentiment** : Analyse de sentiment des commentaires

### 3.3 Fonctionnalités Clés Implémentées
- **Système d'évaluation 5 dimensions** :
  - `offensive_skills` (0-10)
  - `defensive_skills` (0-10) 
  - `passing` (0-10)
  - `dribbling` (0-10)
  - `team_spirit` (0-10)
- **Calculs automatiques** :
  - Moyenne des évaluations par trigger
  - Score de performance composite
  - Mise à jour temps réel des statistiques
- **Sécurité Enterprise** :
  - Row Level Security (RLS) sur toutes les tables
  - Politiques granulaires par rôle et équipe
  - Isolation complète des données entre équipes
- **Performance optimisée** :
  - Index sur toutes les requêtes critiques
  - Contraintes de validation robustes
  - Triggers pour cohérence des données

## 4. Méthodologie TDD
### 4.1 Principes de la Méthodologie TDD
- Écrire un test avant d'implémenter une fonctionnalité
- Implémenter la fonctionnalité minimale pour passer le test
- Refactoriser sans casser les tests existants
- Effectuer des tests de bout en bout pour valider l'intégration complète

## 5. Roadmap et Prochaines Étapes

### 5.1 Phase 1 : MVP Core (✅ TERMINÉ)
- [x] Architecture base Expo + Supabase
- [x] Authentification utilisateurs
- [x] Gestion des équipes avec codes d'invitation
- [x] Système de matchs et tournois
- [x] Base de données complète avec RLS
- [x] Migration Firebase → Expo Notifications
- [x] SQLite local pour fonctionnement offline

### 5.2 Phase 2 : Interface Utilisateur (🔄 EN COURS)
- [ ] Écrans de gestion des équipes
- [ ] Interface de création/édition de matchs
- [ ] Système d'évaluation post-match
- [ ] Notifications push en temps réel
- [ ] Gestion des profils utilisateurs

### 5.3 Phase 3 : Fonctionnalités Avancées (🎯 PLANIFIÉ)
- [ ] Statistiques et tableaux de bord
- [ ] Système de sélection configurable
- [ ] Export/import de données
- [ ] Mode offline complet avec synchronisation

### 5.4 Phase 4 : Intelligence Artificielle (🤖 PRÉPARÉ)
> **Note** : L'infrastructure IA est déjà en place dans la base de données
- [ ] Calcul automatique de la chimie entre joueurs
- [ ] Suggestions de sélection intelligentes
- [ ] Insights de performance automatiques
- [ ] Analyse de sentiment des évaluations
- [ ] Prédictions de résultats de matchs

**📚 Guides disponibles** :
- Architecture IA : `mobile/supabase/AI_IMPLEMENTATION_GUIDE.md`
- Services TypeScript exemples fournis
- Tables et index déjà créés

## 6. Documentation Automatique
### 6.1 Objectif
Générer automatiquement une documentation technique complète et maintenir la cohérence du projet

### 6.2 Technologies Utilisées
- **Typedoc** : Documentation automatique TypeScript
- **Markdown** : Documentation manuelle et guides
- **Scripts npm** : Génération automatique
- **Mermaid** : Diagrammes dans la documentation

### 6.3 État Actuel
- Configuration Typedoc ✓
- Scripts npm pour génération ✓
- Documentation base de données complète ✓
- Guide d'implémentation IA ✓
- Structure des dossiers de documentation ✓

### 6.4 Actions Restantes
- [ ] Documentation automatique des composants React
- [ ] Documentation des hooks personnalisés
- [ ] Documentation des services métier
- [ ] Documentation des types et interfaces
- [ ] Documentation des tests et mocks
- [ ] Intégration CI/CD pour génération auto

## 7. Méthodologie TDD
### 7.1 Principes Appliqués
- **Red-Green-Refactor** : Test → Code → Amélioration
- **Tests First** : Écrire le test avant la fonctionnalité
- **Couverture** : Viser 80%+ de couverture de code
- **Integration Testing** : Tests de bout en bout critiques

### 7.2 Outils Utilisés
- **Jest** : Tests unitaires et d'intégration
- **Vitest** : Tests rapides pour les utilitaires
- **@testing-library/react-native** : Tests composants
- **Supabase Test Client** : Tests base de données

### 7.3 Structure des Tests
```
src/
├── __tests__/
│   ├── services/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── __mocks__/
│   ├── supabase.ts
│   └── expo-notifications.ts
└── jest.setup.js
```

## 7. Suivi des Progrès (Indicateurs Visuels)

| Composant | Status | Détails |
| --- | --- | --- |
| **🏗️ Infrastructure** |
| Initialisation Expo SDK 52 | ✅ | React Native 0.76.3 |
| Configuration Supabase | ✅ | Auth + Database + RLS |
| Migration Firebase → Expo | ✅ | Notifications + Config |
| Base de données complète | ✅ | Schema optimisé + IA ready |
| **👥 Fonctionnalités Core** |
| Authentification | ✅ | Supabase Auth |
| Gestion des équipes | ✅ | CRUD + codes invitation |
| Système de matchs | ✅ | Planning + scores + statuts |
| Évaluations joueurs | 🟡 | Structure BDD ✅, UI en cours |
| Notifications | ✅ | Expo Notifications configuré |
| **� Analytics & IA** |
| Statistiques de base | 🟡 | Calculs auto ✅, dashboard à faire |
| Tables IA préparées | ✅ | Chimie, insights, sélection auto |
| Triggers automatiques | ✅ | Mise à jour temps réel |
| **🛠️ DevOps & Qualité** |
| Tests unitaires | 🟡 | Jest configuré, tests à écrire |
| Documentation technique | ✅ | TypeDoc + guides BDD |
| EAS Build configuration | ✅ | iOS + Android |

**Légende** : ✅ Terminé | 🟡 En cours | ❌ À faire

## 8. Documentation Technique

### 8.1 Structure du Projet
```
mobile/
├── supabase/
│   ├── migrations/
│   │   └── 20250122_complete_optimized_schema.sql  # Schema complet
│   ├── DATABASE_DOCUMENTATION.md                   # Guide complet BDD
│   └── AI_IMPLEMENTATION_GUIDE.md                  # Guide IA future
├── src/
│   ├── services/
│   │   ├── expoNotification.service.ts            # Notifications
│   │   └── sqlite.service.ts                      # Base locale
│   ├── config/
│   │   └── supabase.ts                            # Configuration BDD
│   └── ...
└── app.config.js                                  # Configuration Expo
```

### 8.2 Guides Disponibles
- **Base de données** : `mobile/supabase/DATABASE_DOCUMENTATION.md`
  - Architecture complète des tables
  - Politiques RLS détaillées  
  - Instructions d'installation
- **Intelligence Artificielle** : `mobile/supabase/AI_IMPLEMENTATION_GUIDE.md`
  - Code TypeScript prêt à utiliser
  - Algorithmes de chimie entre joueurs
  - Services d'insights automatiques
- **Variables d'environnement** : `mobile/.env.example`
- **Configuration TypeScript** : `mobile/tsconfig.json`

### 8.3 Commandes Importantes
```bash
# Installation et démarrage
npm install
npm start

# Tests
npm test
npm run test:watch

# Documentation
npm run docs

# Base de données
npx supabase migration run --linked
npx supabase db reset --linked

# Build production
eas build --platform all
```