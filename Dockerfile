# Étape 1 : build
FROM node:22-alpine AS builder

WORKDIR /app

# Copier uniquement les fichiers nécessaires pour les dépendances
COPY package*.json ./
RUN npm ci

# Copier le reste du code
COPY . .

# Génération du client Prisma
RUN npx prisma generate

# Build de Next.js
RUN npm run build

# Étape 2 : exécution
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copier les fichiers essentiels du builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

# Exposer le port par défaut de Next.js
EXPOSE 3000

CMD ["/bin/sh", "-c", "./entrypoint.sh"]

