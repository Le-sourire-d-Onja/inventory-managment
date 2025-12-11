# Étape 1 : build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package.json
RUN npm i

COPY . .

RUN npx prisma generate
RUN npm run build

# Étape 2 : runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copier les fichiers nécessaires du standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", "server.js"]
