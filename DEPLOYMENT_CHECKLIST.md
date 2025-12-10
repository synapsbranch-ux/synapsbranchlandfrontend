# 🚀 Checklist de Déploiement Frontend - Railway

## Avant le Déploiement

### 1. Préparation du Projet
- [ ] Logo `logo.png` placé dans `frontend/public/`
- [ ] Backend déjà déployé sur Railway
- [ ] URL du backend Railway notée
- [ ] `serve` ajouté à `package.json` (déjà fait ✅)

### 2. Variables d'Environnement à Préparer
```env
REACT_APP_BACKEND_URL=https://votre-backend.up.railway.app
NODE_ENV=production
```
- [ ] URL du backend prête à copier

---

## Déploiement Railway

### 3. Configuration Railway
- [ ] Projet Railway créé pour le frontend
- [ ] Repository GitHub connecté
- [ ] Root directory: `frontend` configuré
- [ ] Build configuré (automatique via `railway.json`)

### 4. Variables d'Environnement Railway
Dans Railway Dashboard → Variables:

- [ ] `REACT_APP_BACKEND_URL` ajoutée (URL du backend Railway)
- [ ] `NODE_ENV=production` ajoutée

### 5. Premier Déploiement
- [ ] Code pushed sur GitHub
- [ ] Build réussi (vérifier les logs Railway)
- [ ] URL frontend générée par Railway notée

**URL Frontend:** `https://votre-frontend.up.railway.app`

---

## Configuration OAuth (APRÈS Déploiement)

### 6. Google Cloud Console
URL: https://console.cloud.google.com/apis/credentials

- [ ] OAuth 2.0 Client ID modifié
- [ ] Authorized redirect URI ajoutée:
  ```
  https://votre-frontend.up.railway.app/auth/callback
  ```

### 7. GitHub Developer Settings
URL: https://github.com/settings/developers

- [ ] OAuth App modifiée
- [ ] Callback URL ajoutée:
  ```
  https://votre-frontend.up.railway.app/auth/callback
  ```

### 8. Mise à Jour Backend Railway

Dans les variables d'environnement du **BACKEND**:

- [ ] `FRONTEND_URL` mise à jour avec l'URL du frontend
- [ ] `CORS_ORIGINS` mise à jour avec l'URL du frontend
- [ ] Backend redéployé après modifications

```env
FRONTEND_URL=https://votre-frontend.up.railway.app
CORS_ORIGINS=https://votre-frontend.up.railway.app
```

---

## Tests Post-Déploiement

### 9. Tests de Base
- [ ] Frontend charge correctement
- [ ] Logo s'affiche (pas de 404)
- [ ] Styles CSS appliqués
- [ ] Pas d'erreurs console

### 10. Tests d'Authentification
- [ ] Inscription email fonctionne
- [ ] Login email fonctionne
- [ ] Google OAuth fonctionne (si configuré)
- [ ] GitHub OAuth fonctionne (si configuré)
- [ ] Redirection vers `/invite` pour nouveaux utilisateurs
- [ ] Validation code d'invitation fonctionne
- [ ] Accès au dashboard après code valide

### 11. Tests de Navigation
- [ ] Routes protégées fonctionnent
- [ ] Logout fonctionne et redirige vers `/login`
- [ ] UserProfile dropdown s'affiche
- [ ] Logo cliquable redirige vers home

### 12. Tests API Backend
Ouvrez la console du navigateur et vérifiez:
- [ ] Aucune erreur CORS
- [ ] Requêtes API réussies
- [ ] Tokens JWT stockés correctement

---

## Optimisations (Optionnel)

### 13. Domaine Personnalisé
- [ ] Domaine acheté et configuré
- [ ] CNAME pointant vers Railway
- [ ] OAuth callbacks mis à jour
- [ ] Variables backend mises à jour

### 14. Performance
- [ ] Images optimisées
- [ ] Build size raisonnable (< 5MB)
- [ ] Temps de chargement < 3s

---

## 🔄 Workflow de Mise à Jour

Après le premier déploiement:

1. **Faire des changements localement**
2. **Tester localement:** `npm start`
3. **Commit et push sur GitHub**
4. **Railway redéploie automatiquement!**

---

## 📊 URLs Finales

Remplissez après déploiement:

| Service | URL |
|---------|-----|
| **Frontend** | _________________________ |
| **Backend API** | _________________________ |
| **MongoDB Atlas** | https://cloud.mongodb.com |
| **Railway Dashboard** | https://railway.app/dashboard |

---

## 🆘 Problèmes Courants

### Page Blanche
1. Vérifier logs Railway
2. Vérifier que `logo.png` existe dans `public/`
3. Tester le build localement: `npm run build && npx serve -s build`

### "Network Error"
1. Vérifier `REACT_APP_BACKEND_URL`
2. Vérifier `CORS_ORIGINS` côté backend
3. Tester: `curl https://votre-backend.up.railway.app/api/health`

### OAuth Échoue
1. Vérifier callback URLs (Google/GitHub)
2. Vérifier `FRONTEND_URL` côté backend
3. S'assurer d'utiliser HTTPS

---

## ✅ Validation Finale

Avant de considérer le déploiement complet:

- [ ] ✅ Frontend accessible publiquement
- [ ] ✅ Backend accessible et fonctionne
- [ ] ✅ OAuth configuré et testé
- [ ] ✅ Codes d'invitation fonctionnent
- [ ] ✅ Toutes les routes fonctionnent
- [ ] ✅ Logo et assets chargent
- [ ] ✅ Pas d'erreurs console critiques

---

**Date de déploiement:** __________
**Déployé par:** __________
**Version:** __________
