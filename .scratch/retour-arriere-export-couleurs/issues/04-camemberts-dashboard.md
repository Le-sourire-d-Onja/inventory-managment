# 04: Camemberts du tableau de bord

**Blocked by:** 01

**What to build:** Remplacer les deux graphiques de stock par deux camemberts —
« Demandes par statut » et « Contenants par statut » — avec tooltip
(libellé, nombre, pourcentage), légende permanente listant tous les statuts y
compris à zéro, total au centre et message « Aucune donnée » quand la base est
vide. Les couleurs viennent des tokens de statut. Les cartes de totaux et les
exports de stock restent.

**Status:** resolved

- [x] « Stock par type d'article » et « Contenants par type d'article » sont supprimés, avec leurs sélecteurs d'unité et leur code d'affichage.
- [x] Les récupérations de stock, les cartes « Stock total » / « Stock empoté » et les deux exports de stock sont conservés.
- [x] « Demandes par statut » devient un donut à trois parts.
- [x] « Contenants par statut » est un donut à quatre parts, alimenté par la liste complète des Contenants et regroupé par clé de statut.
- [x] Le survol affiche libellé, nombre et pourcentage.
- [x] La légende est permanente, liste tous les statuts (même à zéro) et utilise les tokens.
- [x] Le total est affiché au centre du donut.
- [x] Une base vide affiche « Aucune donnée ».
- [x] Les deux camemberts sont côte à côte sur grand écran et empilés sur petit.
- [ ] Vérification manuelle des comptes, des couleurs, des légendes et du responsive.

## Comments

Résolu. Les deux graphiques de stock et leur code d'affichage sont supprimés ;
récupérations de stock, cartes de totaux et exports de stock conservés. Le
tableau de bord affiche deux donuts (Demandes : 3 parts ; Contenants : 4 parts
depuis `/api/containers?scope=all`), tooltip libellé/nombre/pourcentage,
légende permanente avec les statuts à zéro (y compris quand la base est vide,
où « Aucune donnée » s'affiche à la place du donut), total au centre et
couleurs des tokens. Les catégories et libellés dérivent des DTO, les parts
sont calculées par `lib/status-breakdown.ts` (testé). Commits : `739f0ed`
(fusion `58b2803`) puis `c09b956` (fusion `41dce3e`). Tests :
`tests/status-breakdown.test.ts` (6). Reste à vérifier à l'œil : rendu,
couleurs, responsive et tooltips.
