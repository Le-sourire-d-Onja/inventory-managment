# 04: Camemberts du tableau de bord

**Blocked by:** 01

**What to build:** Remplacer les deux graphiques de stock par deux camemberts —
« Demandes par statut » et « Contenants par statut » — avec tooltip
(libellé, nombre, pourcentage), légende permanente listant tous les statuts y
compris à zéro, total au centre et message « Aucune donnée » quand la base est
vide. Les couleurs viennent des tokens de statut. Les cartes de totaux et les
exports de stock restent.

**Status:** ready-for-agent

- [ ] « Stock par type d'article » et « Contenants par type d'article » sont supprimés, avec leurs sélecteurs d'unité et leur code d'affichage.
- [ ] Les récupérations de stock, les cartes « Stock total » / « Stock empoté » et les deux exports de stock sont conservés.
- [ ] « Demandes par statut » devient un donut à trois parts.
- [ ] « Contenants par statut » est un donut à quatre parts, alimenté par la liste complète des Contenants et regroupé par clé de statut.
- [ ] Le survol affiche libellé, nombre et pourcentage.
- [ ] La légende est permanente, liste tous les statuts (même à zéro) et utilise les tokens.
- [ ] Le total est affiché au centre du donut.
- [ ] Une base vide affiche « Aucune donnée ».
- [ ] Les deux camemberts sont côte à côte sur grand écran et empilés sur petit.
- [ ] Vérification manuelle des comptes, des couleurs, des légendes et du responsive.
