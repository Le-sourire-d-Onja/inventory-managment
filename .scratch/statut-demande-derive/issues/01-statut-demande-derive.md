# 01: Statut de la Demande dérivé de ses Contenants

**What to build:** Le Statut d'une Demande n'est plus stocké ni validé à la main : il est dérivé de ses Contenants, avec trois états — En attente, Empotée, Distribuée. Règle « tous » : Empotée quand tous les Contenants ont atteint l'Empotage, Distribuée quand tous sont Distribués, sinon En attente (0 Contenant inclus). Le badge et la date « Depuis le … » restent, une barre de progression apparaît au survol, le bouton « Valider » disparaît, et la suppression d'un Contenant Empoté/Distribué est refusée.

**Status:** resolved

- [x] `Demand.status`, `validated_at`, `containerized_at`, `distributed_at` et l'enum `DemandStatus` sont supprimés (schéma + migration).
- [x] Le Statut est calculé à la lecture dans `DemandDto.deriveStatus` selon la règle « tous » ; 0 Contenant → En attente.
- [x] `statusDate` renvoie la date dérivée correspondante (created_at / plus tardive `containerized_at` / plus tardive `distributed_at`).
- [x] Le bouton et la modale « Valider », ainsi que le contrôle de Stock associé, sont retirés.
- [x] La colonne Statut affiche une barre segmentée Attribué/Empoté/Distribué au survol du statut.
- [x] Le filtre, le graphique du tableau de bord et l'export recalent sur les trois valeurs.
- [x] `DELETE /api/containers` refuse (409) un Contenant Empoté ou Distribué ; un Contenant libre reste supprimable.
- [x] Le mode `type=demand` du Stock et les helpers de contrôle de disponibilité sont supprimés.
- [x] Le comportement est couvert par des tests sur les route handlers.

## Comments

Résolu. Le Statut de la Demande est désormais entièrement dérivé : `Demand.status`
et ses colonnes sont retirés par la migration
`20261011160000_derive_demand_status_from_containers` ; `DemandDto.deriveStatus`
calcule `IN_PROGRESS` / `CONTAINERIZED` / `DISTRIBUTED` (libellés En attente /
Empotée / Distribuée) à la lecture, avec `statusDate` dérivé. Le bouton, la
modale et le contrôle de Stock de validation sont retirés, et le mode
`type=demand` du Stock disparaît avec les helpers d'`InsufficientStockError`.
`DELETE /api/containers` refuse un Contenant Empoté/Distribué (nouvelle
`ContainerDeletionError` → 409). UI : badge + « Depuis le … » et barre de
progression segmentée en infobulle au survol.

Tests : `tests/demand-status.test.ts` (7, nouveau), `tests/containers-status.test.ts`
(+3), `tests/demand-attribution.test.ts` (validation retirée), `tests/stocks.test.ts`
(mode `demand` retiré). 55 tests au total.
