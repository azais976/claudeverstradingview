# Guide de publication sur Play Store & App Store

## Étape 1 — Créer les comptes développeur

### Google Play Store (Android)
1. Va sur https://play.google.com/console
2. Crée un compte Google Play Developer ($25 une seule fois)
3. Accepte les conditions d'utilisation
4. Vérifie ton identité (carte d'identité)

### Apple App Store (iOS)
1. Va sur https://developer.apple.com/programs/
2. Inscris-toi au "Apple Developer Program" (99€/an)
3. Tu recevras un email de confirmation sous 48h
4. Une fois approuvé, tu pourras créer l'app dans App Store Connect

---

## Étape 2 — Configurer les secrets GitHub

Va sur ton repo GitHub → Settings → Secrets and variables → Actions

### Secrets communs:
```
NEXT_PUBLIC_SUPABASE_URL       → URL de ton projet Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY  → Clé anon Supabase
```

### Secrets Android:
```
ANDROID_KEYSTORE_BASE64        → keystore en base64 (voir ci-dessous)
ANDROID_KEY_ALIAS              → alias de la clé
ANDROID_KEYSTORE_PASSWORD      → mot de passe du keystore
ANDROID_KEY_PASSWORD           → mot de passe de la clé
```

**Générer un keystore Android (à faire une seule fois sur ton PC):**
```bash
keytool -genkey -v \
  -keystore datereunion-release.jks \
  -alias datereunion \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Convertir en base64 pour le secret GitHub:
base64 -i datereunion-release.jks | pbcopy   # Mac
base64 datereunion-release.jks | xclip       # Linux
```
⚠️ GARDE CE FICHIER .jks EN SÉCURITÉ — tu ne pourras jamais le régénérer !

### Secrets iOS:
```
IOS_CERTIFICATE_BASE64         → certificat de distribution .p12 en base64
IOS_CERTIFICATE_PASSWORD       → mot de passe du certificat
IOS_PROVISIONING_PROFILE_BASE64 → profil de provisionnement en base64
APPLE_TEAM_ID                  → ton Team ID Apple (10 caractères)
KEYCHAIN_PASSWORD              → n'importe quel mot de passe (ex: "temp123")
```

---

## Étape 3 — Builder l'app Android

1. Va sur GitHub → Actions → "Build Android APK / AAB"
2. Clique "Run workflow"
3. Choisis "release"
4. Attends ~10 minutes
5. Télécharge le fichier `.aab` dans les Artifacts

---

## Étape 4 — Publier sur Google Play

1. Va sur https://play.google.com/console
2. Créer une application → "DateRéunion"
3. Remplis la fiche store (voir STORE_LISTING.md)
4. Tableau de bord → Production → Créer une version
5. Uploade le fichier `.aab` téléchargé
6. Soumets pour examen (généralement approuvé sous 1-3 jours)

---

## Étape 5 — Builder l'app iOS

1. Va sur GitHub → Actions → "Build iOS IPA"
2. Configure d'abord les certificats sur developer.apple.com:
   - Créer un "Distribution Certificate"
   - Créer un "App Store Provisioning Profile" pour `com.datereunion.app`
3. Lance le workflow
4. Télécharge le `.ipa`

---

## Étape 6 — Publier sur App Store

1. Va sur https://appstoreconnect.apple.com
2. "+" → Nouvelle app → iOS → "DateRéunion"
3. Bundle ID: `com.datereunion.app`
4. Remplis toutes les infos (voir STORE_LISTING.md)
5. Upload l'IPA via Xcode ou Transporter (app Mac gratuite)
6. Soumets pour examen (1-7 jours)

---

## Résumé des coûts
| | Prix | Récurrence |
|---|---|---|
| Google Play Developer | $25 | Une fois |
| Apple Developer | $99 | Par an |
| Vercel (backend) | Gratuit | - |
| Supabase | Gratuit (jusqu'à 500 MB) | - |
| GitHub Actions | Gratuit (2000 min/mois) | - |
