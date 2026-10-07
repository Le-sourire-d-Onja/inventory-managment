# Valeur monétaire unitaire portée par le Type d'article

Le Type d'article porte une **Valeur** monétaire unitaire, en euros (€), à côté
du poids et du volume unitaires. On la multiplie par la quantité pour estimer la
valeur d'un Stock, d'un Contenant ou d'une Demande. C'est une valeur
*indicative*, pas un prix transactionnel : l'application ne facture rien.

Un champ monétaire avait déjà existé puis été retiré : `Article.value`
(migration `20250708001940_v1_0`), remplacé par `Article.price` et
`ArticleType.price` (`20250715094741_v1_1`), puis supprimé (`20251017145106_v1_2`).
La raison de ce retrait n'est pas documentée ; le besoin a depuis refait surface,
donc on le réintroduit. On le nomme **`value`** et non `price` pour rester aligné
sur le vocabulaire métier (« Valeur ») et ne pas ressusciter l'ancien nom.

## Décisions liées

- **Nom de champ** : `value` (Prisma, DTO, UI « Valeur »). `price` évité.
- **Devise** : euro (€), formaté via `Intl.NumberFormat("fr-FR", …)`.
- **Type** : `Float` requis et positif, comme le poids et le volume ; l'arrondi
  n'est pas une contrainte comptable.
- **Lignes existantes** : colonne ajoutée avec `@default(0)` ; les anciens Types
  d'article affichent `0,00 €` tant qu'ils n'ont pas été édités.
- **Portée** : parallèle strict au poids et au volume — stocké sur `Container`,
  agrégé dans le Stock et les Demande, exporté (Type d'article, Contenant, Stock,
  Donation) et affiché sur le dashboard. L'export des Demandes reste inchangé,
  car il ne porte ni poids ni volume.
