# Statut de la Demande dérivé de ses Contenants

Status: resolved

## Problem Statement

Le Statut d'une Demande est aujourd'hui **stocké** (`Demand.status`) et adossé à
une **validation manuelle** : un gestionnaire clique « Valider » pour faire
passer une Demande de `En attente` à `Validée`. Les valeurs `CONTAINERIZED` et
`DISTRIBUTED` de l'enum existent mais ne sont jamais posées, et les colonnes
`Demand.containerized_at` / `Demand.distributed_at` (miroir de celles du
Contenant) ne sont jamais renseignées.

Conséquence : l'avancement réel d'une Demande — ses Contenants empotés, puis
distribués — reste **invisible au niveau de la Demande**. Il faut en plus
maintenir un état en double, avec le risque de désynchronisation que l'ADR-0002
avait justement écarté pour le Contenant.

## Solution

Supprimer la validation manuelle et **dériver entièrement** le Statut de la
Demande de ses Contenants, avec trois états :

- **En attente** — au moins un Contenant n'a pas encore atteint l'Empotage
  (y compris une Demande à 0 Contenant).
- **Empotée** — tous les Contenants ont atteint au moins l'Empotage.
- **Distribuée** — tous les Contenants sont Distribués.

La règle est « tous » : un jalon au niveau de la Demande veut dire que la
Demande entière est faite. Un Contenant Distribué compte comme ayant franchi
l'Empotage. Le tout est **calculé à la lecture**, jamais stocké : les Contenants
restent l'unique source de vérité. Une **barre de progression** des Contenants
est offerte au survol du statut, et la suppression d'un Contenant Empoté ou
Distribué devient interdite, par symétrie avec le détachement.

## User Stories

1. En tant que gestionnaire, je veux que le Statut d'une Demande reflète
   automatiquement l'état de ses Contenants, afin de ne pas avoir à le tenir à
   la main.
2. En tant que gestionnaire, je veux qu'une Demande soit `En attente` tant que
   tous ses Contenants ne sont pas empotés, afin de savoir qu'elle n'est pas
   terminée.
3. En tant que gestionnaire, je veux qu'une Demande devienne `Empotée` dès que
   tous ses Contenants le sont, afin de savoir qu'elle est prête à partir.
4. En tant que gestionnaire, je veux qu'une Demande devienne `Distribuée` dès
   que tous ses Contenants le sont, afin de savoir qu'elle est livrée.
5. En tant que gestionnaire, je veux qu'une Demande à 0 Contenant reste
   `En attente`, afin d'éviter un statut « tout est fait » sur du vide.
6. En tant que gestionnaire, je veux qu'une Demande dont un Contenant est
   détaché se recalcule, afin que le Statut suive la réalité.
7. En tant que gestionnaire, je veux voir la répartition de mes Contenants
   (Attribué / Empoté / Distribué) au survol d'une Demande, afin d'évaluer son
   avancement d'un coup d'œil.
8. En tant que gestionnaire, je veux conserver le badge de statut et la date
   « Depuis le … », afin de garder la traçabilité.
9. En tant que gestionnaire, je veux qu'il n'y ait plus de bouton « Valider »,
   afin de ne plus maintenir un état manuel redondant.
10. En tant que gestionnaire, je veux ne pas pouvoir supprimer un Contenant
    Empoté ou Distribué, afin de ne pas effacer un acte physique ni fausser le
    Statut de sa Demande.

## Implementation Decisions

### Schéma

- Supprimer `Demand.status`, `Demand.validated_at`, `Demand.containerized_at`
  et `Demand.distributed_at`.
- Supprimer l'enum Prisma `DemandStatus` (plus aucune colonne ne l'utilise).
- Migration `20261011160000_derive_demand_status_from_containers`.

### Dérivation

- Le Statut est un type local `DemandStatus = "IN_PROGRESS" | "CONTAINERIZED" |
  "DISTRIBUTED"` exposé par `DemandDto`, calculé dans `deriveStatus(containers)`.
- Précédence : `DISTRIBUTED` si tous les Contenants sont distribués ; sinon
  `CONTAINERIZED` si tous ont `containerized_at` ou `distributed_at` ; sinon
  `IN_PROGRESS`. Liste vide → `IN_PROGRESS`.
- `statusDate` : `IN_PROGRESS` → `created_at` ; `CONTAINERIZED` → la plus tardive
  des `containerized_at` ; `DISTRIBUTED` → la plus tardive des `distributed_at`.
- Les libellés restent genrés côté Demande : `En attente`, `Empotée`,
  `Distribuée` (le Contenant garde `Empoté`, `Distribué`).

### UI

- Retirer le bouton « Valider », la modale de confirmation et `validateDemand`.
- Colonne Statut : badge + « Depuis le … », avec une **infobulle au survol**
  affichant une barre segmentée Attribué / Empoté / Distribué.
- Filtre des Demandes, graphique du tableau de bord et export recalent sur les
  trois valeurs.

### Suppression / détachement

- `DELETE /api/containers` refuse (409) un Contenant Empoté ou Distribué.
- Le détachement d'un Contenant reste interdit dès qu'il est Empoté/Distribué
  (inchangé) ; la promotion automatique du Statut qui en résulte est voulue.

### Stock

- Aucun contrôle de disponibilité : l'attribution reste la seule consommation.
- Supprimer le mode `type=demand` (mort côté UI) et les helpers de contrôle de
  stock (`stockByType`, `demandConsumption`, `consumptionOf`,
  `assertAvailability`, `InsufficientStockError`).

## Testing Decisions

- **Couture** : les *route handlers* de l'API, appelés directement avec une
  `NextRequest` (couture déjà en place, aucune auth en test direct).
- **Nouveau** : `tests/demand-status.test.ts` couvre la dérivation (0 Contenant,
  tous attribués, tous empotés, partiel, mix empoté/distribué, tous distribués,
  promotion après détachement).
- **Enrichi** : `tests/containers-status.test.ts` couvre le refus de suppression
  d'un Contenant Empoté/Distribué et la suppression d'un Contenant libre.
- **Ajusté** : `demand-attribution` (validation retirée), `stocks` (mode
  `demand` retiré), `container-numbering`, helpers (`createDemand` sans statut,
  `stockQuantityOf` sans mode `demand`).
- Les éléments purement UI (barre au survol, largeur) restent en vérification
  manuelle.

## Out of Scope

- Distinction masculin/féminin des libellés partagés Demande/Contenant.
- Étapes intermédiaires explicites (« partiellement empotée ») : la barre de
  progression les rend visibles, le statut reste à trois valeurs.
- Tests end-to-end / visuels des éléments purement UI.

## Further Notes

- **ADR-0003** renverse la partie d'ADR-0002 qui laissait l'agrégation de la
  Demande hors périmètre ; ADR-0002 reste valable pour le Statut du Contenant
  dérivé de deux dates.
- Le glossaire est mis à jour sur la seule entrée « Statut de la demande ».
