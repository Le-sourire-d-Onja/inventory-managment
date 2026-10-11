# 03: Stock consommé à l'Attribution

**What to build:** Un Type d'article quitte le Stock dès qu'un Contenant qui le porte est attribué (rattaché à une Demande, quel que soit son statut). Un Contenant libre ne consomme rien. L'attribution n'est jamais refusée : aucun contrôle de Stock n'a lieu à l'attribution, la disponibilité n'est contrôlée qu'à la validation d'une Demande. La quantité « disponible » affichée dans les sélecteurs de Contenu reflète le Stock courant. Le contrôle de validation d'une Demande compare le Stock restant augmenté de la consommation propre de cette Demande.

**Blocked by:** 01 (Harnais de tests).

**Status:** resolved

- [x] L'agrégation du Stock soustrait les Contenus dont le Contenant a un `demand_id` non nul, quel que soit le statut de la Demande.
- [x] Un Contenant libre (sans Demande) ne décrémente pas le Stock.
- [x] L'attribution d'un Contenu n'est jamais refusée, même au-delà du Stock disponible.
- [x] La quantité « N disponible » des sélecteurs reflète le Stock courant.
- [x] Le contrôle de validation compare le Stock restant + la consommation propre de la Demande, sans bloquer la Demande elle-même.
- [x] Le comportement est couvert par des tests sur les route handlers.

## Comments

Résolu. Agrégation Stock soustrait les Contenus dont le Contenant a un
`demand_id` non nul (quel que soit le statut); Contenant libre non décrémenté;
validation recalibrée sur Stock + consommation propre. Commits: `73f2fcb` (fusion
`60de749`). Tests: `tests/stocks.test.ts`, `tests/demand-attribution.test.ts`.

Révisé : le contrôle de disponibilité ne tourne plus qu'à la validation d'une
Demande. L'attribution (création de Demande, rattachement/détachement de
Contenant) ne vérifie plus le Stock et n'est donc plus refusée ; le Stock peut
passer en négatif jusqu'à la validation, qui reste stricte.
