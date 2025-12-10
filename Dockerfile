# ÉTAPE 1: Image pour la construction (Build Stage)
FROM node:20-alpine AS builder

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copiez package.json 
COPY package.json ./

# Installer toutes les dépendances existantes ET ajouter 'highlight.js' 
# highlight.js est nécessaire pour les thèmes CSS spécifiques que vous importez.
# Le --force contourne le problème de yarn.lock.
RUN yarn install --force --network-timeout 100000 \
    && yarn add highlight.js remark-gfm rehype-highlight --network-timeout 100000

# Copiez le reste de votre code source
COPY . .

# Exécutez la commande de construction
RUN yarn build

# --- ÉTAPE 2: Image pour le service final (Production Stage) ---
FROM node:20-alpine

# Installez 'serve' globalement 
RUN npm install -g serve

# Définir le répertoire de travail
WORKDIR /app

# Copiez les fichiers construits 
COPY --from=builder /app/build /app/build

# Exposez le port 3000
EXPOSE 3000

# Commande de démarrage 
CMD ["serve", "-s", "build", "-l", "3000"]
