# Le Statut de la Demande est dérivé de ses Contenants, sans validation manuelle

Le Statut d'une Demande est **calculé à la lecture** à partir de ses Contenants
— En attente tant que tous n'ont pas atteint l'Empotage, Empotée quand tous
l'ont atteint, Distribuée quand tous sont distribués — et n'est plus stocké. La
validation manuelle (« Valider ») est supprimée, ainsi que la colonne
`Demand.status` et les dates d'empotage/distribution portées par la Demande.

## Pourquoi

L'ADR-0002 avait laissé l'agrégation du Statut de la Demande « dormante », au
motif qu'elle n'était pas utilisée, et avait écarté tout état de statut stocké.
Le terrain a montré l'inverse : la Demande doit refléter l'avancement de ses
Contenants sans double saisie. Garder un `Demand.status` stocké rouvrirait le
risque de désynchronisation que l'ADR-0002 avait écarté pour le Contenant ; le
dériver à la lecture garde les Contenants comme unique source de vérité.

## Options rejetées

- **Conserver `Demand.status` en cache** : risque de désynchronisation, et une
  écriture à chaque transition de Contenant.
- **Statut de la Demande piloté par une validation manuelle** : c'est ce qui
  existait ; il ne reflétait ni l'empotage ni la distribution réels.
- **Règle « au moins un »** (dès qu'un Contenant est empoté) : un seul colis
  empoté ferait passer toute la Demande pour Empotée.

## Conséquences

- L'empotage et la distribution d'un Contenant font avancer automatiquement le
  Statut de sa Demande.
- Un Contenant Empoté ou Distribué ne peut être ni détaché ni supprimé : il
  ferait reculer le Statut de sa Demande en effaçant un acte physique.
- Une barre de progression (au survol) rend visible un avancement partiel que le
  statut à trois valeurs ne peut pas exprimer.
