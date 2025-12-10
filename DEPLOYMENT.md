# SynapsBranch Frontend - Railway Deployment Guide

## 🚀 Déploiement sur Railway

### Prérequis

1. Compte Railway: https://railway.app
2. Backend déjà déployé sur Railway (avec son URL)
3. Logo dans `public/logo.png`

---

## 📋 Étapes de Déploiement

### 1. Créer un Projet sur Railway

**Via l'Interface Web:**
1. Allez sur https://railway.app/new
2. Sélectionnez "Deploy from GitHub repo"
3. Connectez votre repository
4. Sélectionnez le dossier `frontend` comme root directory

**Via CLI:**
```bash
cd frontend
npm i -g @railway/cli
railway login
railway init
railway up
```

---

### 2. Configurer les Variables d'Environnement

Dans Railway Dashboard → Variables:

```env
# Backend API URL (REQUIS)
REACT_APP_BACKEND_URL=https://votre-backend.up.railway.app

# Production mode
NODE_ENV=production
```

> **Important:** Remplacez `https://votre-backend.up.railway.app` par l'URL réelle de votre backend Railway!

---

### 3. Configuration Automatique

Railway détectera automatiquement:
- ✅ Node.js project (via `package.json`)
- ✅ Build command: `npm install && npm run build`
- ✅ Start command: `npx serve -s build -l $PORT`
- ✅ Port dynamique via `$PORT`

Tout est configuré dans `railway.json`!

---

### 4. Vérifier le Build

Une fois déployé, Railway vous donnera une URL:
```
https://votre-frontend.up.railway.app
```

Vérifiez que:
- [ ] L'application charge correctement
- [ ] Le logo s'affiche (`logo.png` dans `public/`)
- [ ] Les appels API fonctionnent vers le backend

---

## 🔧 Configuration Backend OAuth

Maintenant que le frontend est déployé, mettez à jour les OAuth apps:

### Google Cloud Console

1. Allez sur https://console.cloud.google.com/apis/credentials
2. Modifiez votre OAuth 2.0 Client ID
3. **Authorized redirect URIs:**
   ```
   https://votre-frontend.up.railway.app/auth/callback
   ```

### GitHub Developer Settings

1. Allez sur https://github.com/settings/developers
2. Modifiez votre OAuth App
3. **Authorization callback URL:**
   ```
   https://votre-frontend.up.railway.app/auth/callback
   ```

### Mettre à Jour le Backend

Dans les variables d'environnement du **backend Railway**:

```env
FRONTEND_URL=https://votre-frontend.up.railway.app
CORS_ORIGINS=https://votre-frontend.up.railway.app
```

> Redéployez le backend après cette modification!

---

## 📊 Structure des Fichiers

```
frontend/
├── public/
│   ├── logo.png          ← Votre logo ici!
│   ├── index.html
│   └── ...
├── src/
│   └── ...
├── package.json          ← Dépendances + serve ajouté
├── railway.json          ← Config Railway
├── .gitignore            ← Exclut build/, .env
└── DEPLOYMENT.md         ← Ce fichier
```

---

## 🚨 Troubleshooting

### La Page est Blanche

**Problème:** React ne trouve pas les assets

**Solution:** Vérifiez que `logo.png` est dans `public/` et que le build s'est bien fait

```bash
# Localement, testez:
npm run build
npx serve -s build
```

### Erreur "Network Error" ou "Failed to Fetch"

**Problème:** Le frontend ne peut pas contacter le backend

**Solutions:**
1. Vérifiez `REACT_APP_BACKEND_URL` dans Railway
2. Vérifiez `CORS_ORIGINS` dans le backend Railway
3. Assurez-vous que le backend est déployé et accessible

```bash
# Testez le backend
curl https://votre-backend.up.railway.app/api/health
```

### OAuth ne Fonctionne Pas

**Problème:** Les redirections OAuth échouent

**Solutions:**
1. Vérifiez callback URLs dans Google/GitHub
2. Vérifiez `FRONTEND_URL` dans le backend
3. Assurez-vous d'utiliser HTTPS (pas HTTP)

### Le Logo ne s'Affiche Pas

**Problème:** Image 404

**Solutions:**
1. Assurez-vous que `logo.png` est dans `public/`
2. Ne pas importer le logo, utiliser `process.env.PUBLIC_URL`
3. Committez et redéployez

---

## 🔄 Redéploiement

### Via Railway CLI
```bash
railway up
```

### Via GitHub
Tout push sur la branche configurée redéploiera automatiquement!

---

## 📝 Checklist de Déploiement

- [ ] Logo `logo.png` dans `public/`
- [ ] Variable `REACT_APP_BACKEND_URL` configurée
- [ ] Backend déployé et accessible
- [ ] OAuth callback URLs mis à jour
- [ ] `CORS_ORIGINS` du backend mis à jour
- [ ] `FRONTEND_URL` du backend mis à jour
- [ ] Application testée et fonctionnelle

---

## 🌐 URLs Finales

| Service | URL | Usage |
|---------|-----|-------|
| Frontend | `https://votre-frontend.up.railway.app` | Application principale |
| Backend API | `https://votre-backend.up.railway.app/api` | API REST |
| API Docs | `https://votre-backend.up.railway.app/docs` | Documentation Swagger |

---

## 💡 Production Best Practices

1. ✅ Utilisez HTTPS pour frontend et backend
2. ✅ Configurez les bons CORS origins
3. ✅ Testez OAuth flow en production
4. ✅ Vérifiez que le logo charge (pas de 404)
5. ✅ Activez le monitoring dans Railway
6. ✅ Configurez des domaines personnalisés (optionnel)

---

## 🎯 Domaine Personnalisé (Optionnel)

Pour utiliser votre propre domaine:

1. **Dans Railway:**
   - Settings → Domains → Add Custom Domain
   - Ajoutez `app.votre-domaine.com`

2. **Chez votre registrar DNS:**
   - Créez un `CNAME` pointant vers Railway

3. **Mettez à jour OAuth:**
   - Callback URL: `https://app.votre-domaine.com/auth/callback`

4. **Mettez à jour les variables:**
   - Backend `FRONTEND_URL`: `https://app.votre-domaine.com`
   - Backend `CORS_ORIGINS`: `https://app.votre-domaine.com`

---

**Bon déploiement! 🚀**
