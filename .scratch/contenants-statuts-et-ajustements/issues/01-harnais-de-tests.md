# 01: Harnais de tests

**What to build:** Une suite de tests automatisée exécutable, branchée sur une base Postgres de test dédiée (via le `docker-compose` existant), capable d'appeler les *route handlers* de l'API directement comme des fonctions — sans serveur et sans jeton (l'authentification vit dans le middleware, non invoquée en test direct). C'est la couture unique par laquelle toutes les tickets suivantes vérifient le comportement.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Une commande de test lance la suite (Vitest) depuis un dépôt propre.
- [ ] Un test peut appeler un route handler avec une requête construite et asserter sur la réponse JSON.
- [ ] La suite se connecte à une base de test dédiée et la remet dans un état déterministe (reset + seed via Prisma).
- [ ] Au moins un test d'exemple sur un route handler passe et fige le patron à suivre.
- [ ] Aucune dépendance à un serveur HTTP ni à un jeton d'authentification.
