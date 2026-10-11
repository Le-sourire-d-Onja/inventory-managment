# 08: Retour à la ligne des badges de Contenants

**What to build:** Dans le tableau des Demandes, la colonne qui liste les badges de Contenants passe à la ligne au lieu de déborder, afin que tous les Contenants d'une Demande restent visibles.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Les badges de Contenants d'une ligne de Demande s'enroulent sur plusieurs lignes.
- [x] Aucun débordement horizontal n'apparaît, quel que soit le nombre de Contenants.
- [x] Les autres colonnes du tableau restent alignées.

## Comments

Résolu. La cellule des badges de Contenants du tableau des Demandes passe en
`flex flex-wrap` (largeur fixe `w-95` retirée): plus de débordement horizontal.
Commit: `0815e27` (fusion `f115a59`). Rendu: vérification manuelle (hors
périmètre tests, cf. spec).
