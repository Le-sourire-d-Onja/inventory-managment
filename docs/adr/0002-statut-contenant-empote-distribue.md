# Empoté et Distribué portés par le Contenant, dérivés de dates

Le statut d'un Contenant est **dérivé, jamais stocké** : pas de rattachement →
En attente ; rattaché à une Demande → Attribué ; `containerized_at` renseigné →
Empoté ; `distributed_at` renseigné → Distribué (précédence dans cet ordre). On
ajoute donc deux colonnes nullables, `containerized_at` et `distributed_at`, sur
`Container`, en miroir de celles déjà présentes sur `Demand`.

## Pourquoi

L'empotage et la distribution sont des actes physiques qui concernent un
contenant précis, pas la Demande entière. Les valeurs `CONTAINERIZED` et
`DISTRIBUTED` de `DemandStatus` existaient déjà dans l'enum, mais aucun code ne
les posait : on les laisse dormantes plutôt que de figer une agrégation au niveau
de la Demande, qui n'est pas utilisée pour l'instant.

## Options rejetées

- **Un enum `ContainerStatus` stocké** : redondant avec le rattachement
  (`demand_id`) et avec les dates ; risque de désynchronisation entre l'état
  stocké et l'état réel.
- **Garder le statut au niveau de la Demande** : ne permet pas d'empoter ou de
  distribuer contenant par contenant, alors que c'est ce que le terrain demande.

## Conséquences

- Le détachement d'un Contenant (retour à En attente) est interdit dès qu'il est
  Empoté ou Distribué ; un Contenant détaché voit ses deux dates remises à
  `null`.
- Le Stock est consommé dès l'**attribution** (un Contenant rattaché à une
  Demande sort du stock), plus à la validation ; l'empotage et la distribution
  ne modifient plus le Stock.
- Le glossaire est mis à jour (Statut du contenant dérivé, Empotage/Attribution/
  Distribution redéfinis, Stock redéfini).
