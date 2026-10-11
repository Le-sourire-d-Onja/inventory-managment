# 03: Stock consommé à l'Attribution

**What to build:** Un Type d'article quitte le Stock dès qu'un Contenant qui le porte est attribué (rattaché à une Demande, quel que soit son statut). Un Contenant libre ne consomme rien. Attribuer plus de Contenus qu'il n'y a de Stock disponible est refusé, et cette disponibilité est revérifiée à chaque (ré)attribution. La quantité « disponible » affichée dans les sélecteurs de Contenu reflète le Stock courant. Le contrôle de validation d'une Demande est recalibré pour comparer le Stock restant augmenté de la consommation propre de cette Demande.

**Blocked by:** 01 (Harnais de tests).

**Status:** ready-for-agent

- [ ] L'agrégation du Stock soustrait les Contenus dont le Contenant a un `demand_id` non nul, quel que soit le statut de la Demande.
- [ ] Un Contenant libre (sans Demande) ne décrémente pas le Stock.
- [ ] L'attribution d'un Contenu qui dépasse le Stock disponible est refusée.
- [ ] La quantité « N disponible » des sélecteurs reflète le Stock courant.
- [ ] Le contrôle de validation compare le Stock restant + la consommation propre de la Demande, sans bloquer la Demande elle-même.
- [ ] Le comportement est couvert par des tests sur les route handlers.
