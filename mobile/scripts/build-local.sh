#!/bin/bash

# 🚀 Script de build local EAS pour sport-connect
# Suit les bonnes pratiques EAS pour la gestion sécurisée des secrets

set -e  # Arrêter en cas d'erreur

echo "🚀 Configuration de l'environnement pour le build EAS local..."

# ===============================================
# 1. Configuration des SDK Android et Java
# ===============================================
export ANDROID_HOME=~/Library/Android/sdk
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.16/libexec/openjdk.jdk/Contents/Home

echo "✅ ANDROID_HOME: $ANDROID_HOME"
echo "✅ JAVA_HOME: $JAVA_HOME"

# ===============================================
# 2. Vérification des prérequis
# ===============================================
if [ ! -d "$ANDROID_HOME" ]; then
    echo "❌ Erreur: Android SDK non trouvé à $ANDROID_HOME"
    echo "   Installez Android Studio ou configurez ANDROID_HOME"
    exit 1
fi

if [ ! -d "$JAVA_HOME" ]; then
    echo "❌ Erreur: Java 17 non trouvé à $JAVA_HOME"
    echo "   Installez Java 17 via Homebrew: brew install openjdk@17"
    exit 1
fi

# ===============================================
# 3. Gestion sécurisée des secrets Firebase
# ===============================================
echo "🔐 Configuration des secrets Firebase..."

# Méthode 1: Depuis les variables d'environnement locales (recommandé)
if [ -z "$GOOGLE_SERVICES_JSON" ] || [ -z "$GOOGLE_SERVICE_INFO_PLIST" ]; then
    echo "⚠️  Variables Firebase non définies"
    echo ""
    echo "📖 CONFIGURATION REQUISE:"
    echo ""
    echo "1. Créez un fichier .env.local (non committé) avec vos secrets:"
    echo "   echo 'GOOGLE_SERVICES_JSON=...' > .env.local"
    echo "   echo 'GOOGLE_SERVICE_INFO_PLIST=...' >> .env.local"
    echo ""
    echo "2. OU exportez directement les variables:"
    echo "   export GOOGLE_SERVICES_JSON='...'"
    echo "   export GOOGLE_SERVICE_INFO_PLIST='...'"
    echo ""
    echo "3. OU utilisez EAS secrets (pour équipe):"
    echo "   npx eas secret:list"
    echo "   npx eas env:pull --environment development"
    echo ""
    echo "❌ Arrêt du build - Secrets Firebase manquants"
    exit 1
fi

# ===============================================
# 4. Validation des secrets
# ===============================================
echo "🔍 Validation des secrets Firebase..."

# Vérifier que GOOGLE_SERVICES_JSON est un JSON valide
if ! echo "$GOOGLE_SERVICES_JSON" | jq . > /dev/null 2>&1; then
    echo "❌ Erreur: GOOGLE_SERVICES_JSON n'est pas un JSON valide"
    echo "   Utilisez 'jq' pour valider votre JSON"
    exit 1
fi

# Vérifier que GOOGLE_SERVICE_INFO_PLIST contient du XML
if ! echo "$GOOGLE_SERVICE_INFO_PLIST" | grep -q "<?xml"; then
    echo "❌ Erreur: GOOGLE_SERVICE_INFO_PLIST ne semble pas être un fichier plist valide"
    exit 1
fi

echo "✅ Secrets Firebase validés"

# ===============================================
# 5. Création temporaire des fichiers Firebase
# ===============================================
echo "📝 Création des fichiers Firebase temporaires..."

# Créer les fichiers temporaires (seront supprimés après le build)
echo "$GOOGLE_SERVICES_JSON" > google-services.json
echo "$GOOGLE_SERVICE_INFO_PLIST" > GoogleService-Info.plist

# Vérifier la création
if [ ! -f "google-services.json" ] || [ ! -f "GoogleService-Info.plist" ]; then
    echo "❌ Erreur: Impossible de créer les fichiers Firebase"
    exit 1
fi

echo "✅ Fichiers Firebase créés temporairement"

# ===============================================
# 6. Configuration des variables d'environnement Supabase
# ===============================================
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "⚠️  Variables Supabase non définies (utilisation des valeurs par défaut)"
    export SUPABASE_URL="${SUPABASE_URL:-https://your-project.supabase.co}"
    export SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-your-supabase-anon-key}"
fi

# ===============================================
# 7. Fonction de nettoyage
# ===============================================
cleanup() {
    echo "🧹 Nettoyage des fichiers temporaires..."
    rm -f google-services.json GoogleService-Info.plist
    echo "✅ Fichiers temporaires supprimés"
}

# Nettoyage automatique en cas d'interruption
trap cleanup EXIT INT TERM

# ===============================================
# 8. Lancement du build EAS
# ===============================================
echo "🔨 Lancement du build EAS Android..."
echo "   Profile: development"
echo "   Mode: local"
echo ""

# Lancer le build avec gestion d'erreur
if npx eas build --platform android --profile development --local; then
    echo ""
    echo "✅ Build terminé avec succès !"
    echo "📱 APK généré dans le dossier mobile/"
    
    # Afficher l'APK le plus récent
    LATEST_APK=$(ls -t build-*.apk 2>/dev/null | head -1)
    if [ -n "$LATEST_APK" ]; then
        echo "📋 Fichier: $LATEST_APK"
        echo "📏 Taille: $(du -h "$LATEST_APK" | cut -f1)"
    fi
else
    echo ""
    echo "❌ Build échoué"
    echo "💡 Vérifiez les logs ci-dessus pour diagnostiquer le problème"
    exit 1
fi
