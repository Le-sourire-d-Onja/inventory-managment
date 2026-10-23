# 02: Annulation d'un empotage ou d'une distribution

**Blocked by:** 01

**What to build:** Deux actions serveur qui font reculer un Contenant d'un seul
cran — `uncontainerize` (Empoté → Attribué) et `undistribute` (Distribué →
Empoté) — en effaçant uniquement la date concernée. Les quatre transitions
(avant et arrière) passent par une confirmation explicite avec identifiant,
statut actuel → cible et conséquence, et les succès comme les refus 409 remontent
en toast. Les contournements du statut sont refermés : plus de détachement d'un
Contenant daté via l'édition, plus de rattachement d'un Contenant daté, et un
PATCH sans `contents` ne vide plus les Contenus.

**Status:** ready-for-agent

- [ ] L'endpoint d'action accepte `uncontainerize` et `undistribute` ; toute combinaison illégale renvoie 409.
- [ ] `uncontainerize` exige `containerized_at` renseigné et `distributed_at` nul, et efface seulement `containerized_at`.
- [ ] `undistribute` exige `distributed_at` renseigné et efface seulement `distributed_at`.
- [ ] Une annulation ne touche ni au rattachement, ni aux Contenus, ni aux agrégats, ni au Stock.
- [ ] Un Contenant daté sans Demande peut être annulé ; une fois ses deux dates nulles, il est En attente.
- [ ] Le Statut de la Demande recule automatiquement (vérifié par test, aucune écriture supplémentaire).
- [ ] Fenêtres de confirmation pour Empoter, Distribuer, Annuler l'empotage et Annuler la distribution, avec le texte propre à chaque cas et la date effacée pour une annulation.
- [ ] Icône d'annulation visible seulement sur les Contenants Empotés/Distribués, toujours dans la table Contenants.
- [ ] Toasts de succès et d'erreur ; bouton désactivé pendant l'appel.
- [ ] Modifier le rattachement d'un Contenant daté est refusé en 409 (même valeur acceptée).
- [ ] Rattacher un Contenant daté à une Demande est refusé en 409 (création et mise à jour, y compris `linkedContainers`).
- [ ] Un PATCH sans `contents` laisse les Contenus intacts ; un `contents` fourni les remplace.
- [ ] Tests des deux annulations heureuses, des refus, du Contenant orphelin, de la remontée du Statut de Demande, du Stock inchangé et de la préservation des Contenus.
- [x] ADR-0004 et glossaire (Annulation).
