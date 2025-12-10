# ÉTAPE 1: Image pour la construction (Build Stage)
# Utilisez l'image Node.js compatible avec l'exigence de votre package.json (>=20.0.0)
FROM node:20-alpine AS builder

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copiez package.json. Nous ne copions pas yarn.lock si l'installation est forcée.
COPY package.json ./

# Installer les dépendances existantes et forcer la réinstallation
# Cette commande remplace le comportement par défaut de Railway.
RUN yarn install --force --network-timeout 100000

# AJOUT DES NOUVEAUX PACKAGES
RUN yarn add remark-gfm rehype-highlight --network-timeout 100000

# Copiez le reste de votre code source
COPY . .

# Exécutez la commande de construction
RUN yarn build

# --- ÉTAPE 2: Image pour le service final (Production Stage) ---
# Utiliser une image plus légère pour servir les fichiers statiques
FROM node:20-alpine

# Installez 'serve' globalement pour servir les fichiers construits
RUN npm install -g serve

# Définir le répertoire de travail
WORKDIR /app

# Copiez les fichiers construits depuis l'étape 'builder'
COPY --from=builder /app/build /app/build

# Exposez le port (Port par défaut pour les applications React)
EXPOSE 3000

# Commande de démarrage pour servir l'application construite
CMD ["serve", "-s", "build", "-l", "3000"]
