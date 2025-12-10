# ÉTAPE 1: Image pour la construction (Build Stage)
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json ./

# Installation complète des dépendances
RUN yarn install --force --network-timeout 100000 \
    && yarn add highlight.js remark-gfm rehype-highlight --network-timeout 100000

COPY . .

# Construction
RUN yarn build

# --- ÉTAPE 2: Image pour le service final (Production Stage) ---
FROM node:20-alpine

# Installez 'serve' globalement 
RUN npm install -g serve

WORKDIR /app

# Copiez les fichiers construits 
COPY --from=builder /app/build /app/build

# Exposez le port 3000 (standard pour le frontend)
EXPOSE 3000

# Commande de démarrage corrigée : Utilisation de 'sh -c' et du protocole 'tcp://' 
# pour garantir que 'serve' évalue correctement le port de Railway.
CMD sh -c "serve -s build -l tcp://$PORT"
