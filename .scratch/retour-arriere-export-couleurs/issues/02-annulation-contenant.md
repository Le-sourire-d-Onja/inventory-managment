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

**Status:** resolved

- [x] L'endpoint d'action accepte `uncontainerize` et `undistribute` ; toute combinaison illégale renvoie 409.
- [x] `uncontainerize` exige `containerized_at` renseigné et `distributed_at` nul, et efface seulement `containerized_at`.
- [x] `undistribute` exige `distributed_at` renseigné et efface seulement `distributed_at`.
- [x] Une annulation ne touche ni au rattachement, ni aux Contenus, ni aux agrégats, ni au Stock.
- [x] Un Contenant daté sans Demande peut être annulé ; une fois ses deux dates nulles, il est En attente.
- [x] Le Statut de la Demande recule automatiquement (vérifié par test, aucune écriture supplémentaire).
- [x] Fenêtres de confirmation pour Empoter, Distribuer, Annuler l'empotage et Annuler la distribution, avec le texte propre à chaque cas et la date effacée pour une annulation.
- [x] Icône d'annulation visible seulement sur les Contenants Empotés/Distribués, toujours dans la table Contenants.
- [x] Toasts de succès et d'erreur ; bouton désactivé pendant l'appel.
- [x] Modifier le rattachement d'un Contenant daté est refusé en 409 (même valeur acceptée).
- [x] Rattacher un Contenant daté à une Demande est refusé en 409 (création et mise à jour, y compris `linkedContainers`).
- [x] Un PATCH sans `contents` laisse les Contenus intacts ; un `contents` fourni les remplace.
- [x] Tests des deux annulations heureuses, des refus, du Contenant orphelin, de la remontée du Statut de Demande, du Stock inchangé et de la préservation des Contenus.
- [x] ADR-0004 et glossaire (Annulation).

## Comments

Résolu. `uncontainerize` (Empoté → Attribué) et `undistribute` (Distribué →
Empoté) effacent uniquement la date concernée ; les combinaisons illégales
renvoient 409 avec un message français lisible. Les quatre transitions passent
par la confirmation de la table Contenants (identifiant, actuel → cible,
conséquence, date effacée), avec toasts et bouton désactivé. Les contournements
sont refermés : changement de rattachement d'un Contenant daté refusé (valeur
identique acceptée), rattachement d'un daté refusé en création/mise à jour, et
PATCH sans `contents` préservant les Contenus. Commits : `5376812` (fusion
`96ba3b4`) puis `1fc06f9` (fusion `41dce3e`). Tests :
`tests/container-cancellation.test.ts` (18), plus la couverture Statut/Stock
existante.
