#!/bin/bash

# Script pour configurer Java 17 et Android SDK avant les builds EAS
# Usage: ./scripts/setup-java.sh

echo "🔧 Configuration de l'environnement pour EAS Build..."

# Vérifier si Java 17 est installé
if [ ! -d "/opt/homebrew/Cellar/openjdk@17" ]; then
    echo "❌ Java 17 n'est pas installé. Installation via Homebrew..."
    brew install openjdk@17
fi

# Trouver le chemin exact de Java 17
JAVA17_PATH=$(find /opt/homebrew/Cellar/openjdk@17 -name "Contents" -type d | head -1 | sed 's/Contents$/Contents\/Home/')

if [ -z "$JAVA17_PATH" ]; then
    echo "❌ Impossible de trouver Java 17"
    exit 1
fi

echo "✅ Java 17 trouvé: $JAVA17_PATH"

# Configurer JAVA_HOME
export JAVA_HOME="$JAVA17_PATH"

# Vérifier et configurer ANDROID_HOME
ANDROID_SDK_PATH="$HOME/Library/Android/sdk"
if [ -d "$ANDROID_SDK_PATH" ]; then
    export ANDROID_HOME="$ANDROID_SDK_PATH"
    echo "✅ Android SDK trouvé: $ANDROID_HOME"
else
    echo "❌ Android SDK non trouvé dans $ANDROID_SDK_PATH"
    echo "� Veuillez installer Android Studio et le SDK Android"
    exit 1
fi

# Vérifier les versions
echo "📋 Configuration actuelle:"
echo "   Java: $($JAVA_HOME/bin/java -version 2>&1 | head -1)"
echo "   Android SDK: $ANDROID_HOME"

echo ""
echo "🚀 Environnement configuré ! Vous pouvez maintenant lancer:"
echo "   eas build --platform android --profile development --local"
echo ""
echo "💡 Pour rendre cette configuration permanente, ajoutez ceci à votre ~/.zshrc:"
echo "   export JAVA_HOME=\"$JAVA17_PATH\""
echo "   export ANDROID_HOME=\"$ANDROID_SDK_PATH\""
