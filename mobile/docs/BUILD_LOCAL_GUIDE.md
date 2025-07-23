# 🚀 Guide Build Local EAS avec Firebase

Ce guide explique comment faire des builds locaux EAS avec Firebase pour l'application sport-connect en suivant les **bonnes pratiques de sécurité**.

## 🔐 Gestion sécurisée des secrets

### ✅ Méthodes recommandées

**1. Fichier .env.local (Développement individuel)**
```bash
# Créer votre fichier de secrets local
cp .env.firebase.example .env.local

# Éditer avec vos vraies valeurs Firebase
nano .env.local

# Utiliser
source .env.local && ./scripts/build-local.sh
```

**2. EAS Secrets (Équipe/Production)**
```bash
# Configurer sur EAS Cloud
npx eas secret:create --scope project --name GOOGLE_SERVICES_JSON --value "..."
npx eas secret:create --scope project --name GOOGLE_SERVICE_INFO_PLIST --value "..."

# Récupérer localement
npx eas env:pull --environment development

# Build
./scripts/build-local.sh
```

**3. Variables d'environnement temporaires**
```bash
export GOOGLE_SERVICES_JSON='...'
export GOOGLE_SERVICE_INFO_PLIST='...'
./scripts/build-local.sh
```

### ❌ À éviter absolument

- ❌ Secrets dans le code source
- ❌ Secrets dans les scripts versionnés
- ❌ Fichiers Firebase commités dans git
- ❌ Secrets en dur dans les variables

## 📋 Prérequis

### 1. SDK Android et Java
```bash
# Java 17 via Homebrew
brew install openjdk@17

# Android SDK via Android Studio
# Ou: brew install android-sdk
```

### 2. EAS CLI
```bash
npm install -g eas-cli
npx eas login
```

### 3. Outils de validation
```bash
# Pour valider le JSON
brew install jq
```

## 🛠️ Utilisation

### Méthode recommandée avec .env.local

```bash
# 1. Configurer les secrets
cp .env.firebase.example .env.local
# Éditer .env.local avec vos vraies valeurs Firebase

# 2. Build
source .env.local && ./scripts/build-local.sh
```

### Script automatisé

Le script `scripts/build-local.sh` :

✅ **Sécurité**
- Vérifie que les secrets sont définis
- Valide le format JSON/XML
- Crée des fichiers temporaires
- Nettoie automatiquement après le build
- Gestion d'erreur avec trap

✅ **Prérequis**
- Vérifie Android SDK et Java
- Valide la configuration EAS

✅ **Build**
- Configure l'environnement
- Lance EAS build local
- Affiche les résultats

## 🔧 Configuration

### eas.json
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "env": {
        "ENVIRONMENT": "development",
        "SUPABASE_URL": "$SUPABASE_URL",
        "SUPABASE_ANON_KEY": "$SUPABASE_ANON_KEY",
        "FCM_ENABLED": "false",
        "GOOGLE_SERVICES_JSON": "$GOOGLE_SERVICES_JSON",
        "GOOGLE_SERVICE_INFO_PLIST": "$GOOGLE_SERVICE_INFO_PLIST",
        "ANDROID_HOME": "/Users/beij/Library/Android/sdk",
        "JAVA_HOME": "/opt/homebrew/Cellar/openjdk@17/17.0.16/libexec/openjdk.jdk/Contents/Home"
      }
    }
  }
}
```

### .gitignore (Sécurité)
```ignore
# Secrets Firebase - Ne jamais committer !
google-services.json
GoogleService-Info.plist
.env.local
.env.*.local

# Fichiers d'exemple OK à committer
!.env.firebase.example
```

## 🚀 Commandes rapides

```bash
# Build Android développement
source .env.local && ./scripts/build-local.sh

# Build iOS (futur)
source .env.local && npx eas build --platform ios --profile development --local

# Valider les secrets Firebase
echo "$GOOGLE_SERVICES_JSON" | jq .
```

## 🔐 Obtenir vos secrets Firebase

### 1. Console Firebase
1. Aller sur https://console.firebase.google.com
2. Sélectionner votre projet
3. **Android** : Paramètres projet > Général > google-services.json
4. **iOS** : Paramètres projet > Général > GoogleService-Info.plist

### 2. Format pour .env.local
```bash
# Copier le contenu JSON sur une seule ligne
GOOGLE_SERVICES_JSON='{"project_info":{"project_number":"123"}...}'

# Copier le contenu XML sur une seule ligne  
GOOGLE_SERVICE_INFO_PLIST='<?xml version="1.0"?>...'
```

## ✅ Avantages de cette approche

- � **Sécurité** : Secrets jamais dans git
- 👥 **Équipe** : EAS secrets partagés  
- 🧹 **Clean** : Nettoyage automatique
- 🔍 **Validation** : Vérification des formats
- 🛡️ **Robuste** : Gestion d'erreur complète

## 🆘 Dépannage

### Erreur "Secrets Firebase manquants"
```bash
# Vérifier que les variables sont définies
echo $GOOGLE_SERVICES_JSON | head -c 50

# Créer .env.local depuis l'exemple
cp .env.firebase.example .env.local
```

### Erreur "JSON invalide"
```bash
# Valider avec jq
echo "$GOOGLE_SERVICES_JSON" | jq .
```

### Erreur "Android SDK not found"
```bash
# Vérifier le chemin
ls ~/Library/Android/sdk
export ANDROID_HOME=~/Library/Android/sdk
```

---

**🔐 Rappel sécurité** : Ne jamais committer de vrais secrets Firebase. Utilisez toujours .env.local ou EAS secrets.
