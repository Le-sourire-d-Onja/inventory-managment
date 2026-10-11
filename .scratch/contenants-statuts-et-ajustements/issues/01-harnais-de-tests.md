# 01: Harnais de tests

**What to build:** Une suite de tests automatisée exécutable, branchée sur une base Postgres de test dédiée (via le `docker-compose` existant), capable d'appeler les *route handlers* de l'API directement comme des fonctions — sans serveur et sans jeton (l'authentification vit dans le middleware, non invoquée en test direct). C'est la couture unique par laquelle toutes les tickets suivantes vérifient le comportement.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Une commande de test lance la suite (Vitest) depuis un dépôt propre.
- [x] Un test peut appeler un route handler avec une requête construite et asserter sur la réponse JSON.
- [x] La suite se connecte à une base de test dédiée et la remet dans un état déterministe (reset + seed via Prisma).
- [x] Au moins un test d'exemple sur un route handler passe et fige le patron à suivre.
- [x] Aucune dépendance à un serveur HTTP ni à un jeton d'authentification.

## Comments

Résolu. Vitest + base de test dédiée (`TEST_DATABASE_URL`, base `_test`
obligatoire), route handlers appelés directement comme fonctions. Couture figée
par `tests/helpers/db.ts` et `tests/containers.test.ts`.
Commit: `8c617bf` (fusion `f88a06a`). Vérif finale: `npm test` = 7 fichiers /
45 tests passants, `npx tsc --noEmit` OK.
