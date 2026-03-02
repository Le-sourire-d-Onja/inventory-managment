# ---------- BUILDER ----------
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./

RUN npm ci

# copie schema prisma AVANT pour cache docker
COPY prisma ./prisma

# génère le client prisma
RUN npx prisma generate

# copie le reste du projet
COPY . .

# build next
RUN npm run build


# ---------- RUNTIME ----------
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.* ./

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
