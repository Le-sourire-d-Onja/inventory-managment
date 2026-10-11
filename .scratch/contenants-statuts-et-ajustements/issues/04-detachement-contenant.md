# 04: Détachement d'un Contenant

**What to build:** Retirer un Contenant d'une Demande le détache au lieu de le supprimer : il repasse à En attente, conserve ses Contenus et restitue le Stock. Un Contenant Empoté ou Distribué ne peut plus être détaché (aucune corbeille dans la fenêtre de Demande). Supprimer une Demande entière détache ses Contenants non Empotés (retour à En attente) et laisse les Empotés/Distribués perdre le lien tout en gardant leur état. Au passage, la fenêtre de Demande doit recharger les Contenants déjà liés à l'édition, pour ne plus les détruire/recréer silencieusement à chaque enregistrement.

**Blocked by:** 02 (Statut du Contenant), 03 (Stock consommé à l'Attribution).

**Status:** resolved

- [x] Retirer un Contenant de la Demande puis enregistrer le détache (`demand_id` nul) sans supprimer la ligne.
- [x] Le Contenant détaché repasse à En attente et conserve tous ses Contenus.
- [x] Ses dates d'empotage/distribution sont remises à vide et ses Contenus réintègrent le Stock.
- [x] Une corbeille est absente pour un Contenant Empoté ou Distribué.
- [x] Supprimer une Demande détache les Contenants non Empotés et préserve l'état des Empotés/Distribués.
- [x] À l'édition d'une Demande, les Contenants déjà liés sont rechargés (plus de destruction/recréation silencieuse).
- [x] Le comportement est couvert par des tests sur les route handlers.

## Comments

Résolu. `DemandsService.update` ne détruit plus: détache les Contenants retirés
(`demand_id = null`, dates remises à vide, Contenus conservés, Stock restitué),
met à jour les Contenants existants en place, refuse (409) le détachement d'un
Empoté/Distribué; la fenêtre de Demande recharge les Contenants liés (plus de
destruction/recréation). Commits: `f0c74c7` (fusion `07ad128`). Tests:
`tests/demand-detach.test.ts` (8).
