#!/usr/bin/env bash
# Génère le projet Android (Capacitor) autour de lumen/ puis compile l'APK.
# Usage : depuis lumen/android-app : bash build-apk.sh   (JDK 17 + Android SDK requis)
set -euo pipefail
cd "$(dirname "$0")"
rm -rf build && mkdir build && cd build
cp ../package.json ../capacitor.config.json .
npm install --no-audit --no-fund
# Contenu web = le jeu, sans les outils de développement
mkdir www
rsync -a --exclude android-app --exclude tests --exclude tools --exclude '*.md' --exclude package.json ../../ www/
npx cap add android
# Icône (facultatif : on garde l'icône par défaut si ça échoue)
( mkdir -p assets && node -e "require('sharp')('../../assets/icon.svg',{density:384}).resize(1024,1024).flatten({background:'#0b0f24'}).png().toFile('assets/icon-only.png')" \
  && npx @capacitor/assets generate --android --iconBackgroundColor '#0b0f24' ) || echo "icône par défaut"
# Paysage + plein écran
M=android/app/src/main/AndroidManifest.xml
sed -i 's|<activity|<activity android:screenOrientation="sensorLandscape"|' "$M"
S=android/app/src/main/res/values/styles.xml
sed -i 's|</style>|<item name="android:windowFullscreen">true</item><item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item></style>|' "$S"
npx cap sync android
cd android && ./gradlew --no-daemon assembleDebug
cp app/build/outputs/apk/debug/app-debug.apk ../../lumen.apk
echo "APK : $(cd ../.. && pwd)/lumen.apk"
