# 05: Formatage des nombres

**What to build:** Les poids et volumes s'affichent sans décimale et les Valeurs avec 2 décimales, partout où ils apparaissent : tableau de bord, listes des Contenants / Demandes / Types d'article, et champs calculés des fenêtres de Contenant et de Demande. La précision stockée et les exports Excel restent inchangés.

**Blocked by:** 01 (Harnais de tests).

**Status:** resolved

- [x] Des formateurs partagés produisent un poids et un volume à 0 décimale, et une Valeur à 2 décimales.
- [x] Le tableau de bord applique ces formats (poids/volume sans décimale, Valeur à 2 décimales).
- [x] Les listes Contenants, Demandes et Types d'article appliquent ces formats.
- [x] Les champs calculés (poids/volume/Valeur) des fenêtres appliquent ces formats.
- [x] La précision stockée en base et les exports Excel sont inchangés.
- [x] Les formateurs sont couverts par des tests unitaires.

## Comments

Résolu. `formatWeight` / `formatVolume` (0 décimale) et `formatEuro`
(2 décimales) partagés dans `lib/utils.ts`, appliqués au tableau de bord, aux
listes Contenants / Demandes / Types d'article et aux champs calculés des
fenêtres. Précision stockée et exports Excel inchangés. Commits: `7f5bf4f`
(fusion `743b75f`). Tests: `tests/utils.test.ts`.
