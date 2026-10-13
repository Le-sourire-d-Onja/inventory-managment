# Filtrer les Contenants par plusieurs Types d'article

Status: resolved

## Problem Statement

La vue Contenants ne permet de filtrer que par Association. Pour préparer des
envois ou retrouver du matériel, on veut filtrer les Contenants par les Types
d'article de leurs Contenus, et pouvoir en sélectionner **plusieurs** à la fois
(ex. « Couches » **ou** « Lait »). Le filtre existant du composant de tableau
partagé est mono-valeur, ce qui ne le permet pas.

## Solution

Ajouter dans la vue Contenants un second filtre, **multi-sélection**, portant
sur les Types d'article présents dans le Contenu des Contenants. Un Contenant est
retenu si l'un des Types sélectionnés apparaît dans au moins un de ses Contenus
(OR). Le filtre se combine en ET avec les autres filtres et la recherche.

## User Stories

1. En tant que gestionnaire, je veux filtrer les Contenants par un ou plusieurs
   Types d'article, afin de retrouver le matériel qui m'intéresse.
2. En tant que gestionnaire, je veux que sélectionner deux Types affiche les
   Contenants portant **l'un ou l'autre** (OR), afin d'élargir et non de
   restreindre ma recherche.
3. En tant que gestionnaire, je veux rechercher un Type d'article en tapant son
   **nom** dans la zone de recherche du filtre, afin de le cocher rapidement.
4. En tant que gestionnaire, je veux voir les Types cochés sous forme de badges
   et pouvoir en retirer un d'un clic, afin de garder le contrôle.
5. En tant que gestionnaire, je veux que le filtre se combine avec le filtre
   Association et la recherche, afin d'affiner progressivement.
6. En tant que gestionnaire, je veux que « Réinitialiser » efface aussi ce
   filtre, afin de revenir à la liste complète.

## Implementation Decisions

### Composant de tableau (`components/data-table.tsx`)

- Ajouter une option `multiple?: boolean` à `DataTableFilter`.
- Si `multiple`, rendre le `MultiSelect` du registre WDS Shadcn
  (`components/ui/multi-select.tsx`, installé via
  `npx shadcn@latest add @wds/multi-select`) : recherche + badges + contrôle
  `values` / `onValuesChange`. Une sélection vide est transmise comme
  `undefined` pour ne poser aucune restriction.
- Sinon, garder le `<select>` mono-valeur existant (filtres Association et
  Statut inchangés).
- Chaque `MultiSelectItem` porte `value={type.id}` et `keywords={[type.name]}`
  : la **valeur** est l'identifiant stable, le **nom** reste cherchable.

### Vue Contenants

- Colonne « Contenu » (`app/containers/columns.tsx`) : `id: "content"` et un
  `filterFn` maison qui applique le OR sur `filterValue: string[]` via
  `row.original.contents` et `type.id`.
- Logique pure extraite dans `app/containers/filters.ts` :
  `matchesAnyArticleType(contents, typeIds)` et
  `articleTypeFilterOptions(containers)` (dédup par `type.id`, tri par nom en
  locale française).
- Page (`app/containers/page.tsx`) : ajouter le filtre
  `{ columnId: "content", label: "Type d'article", multiple: true, options }`.

### Portée

- Aucune modification de l'API, du schéma Prisma, des exports ni de l'URL.
- Le filtre est propre à la vue Contenants.

## Testing Decisions

- **Couture** : `app/containers/filters.ts` (fonctions pures), cohérent avec la
  couture secondaire « formateurs/fonctions pures » du dépôt.
- `tests/container-type-filter.test.ts` couvre le OR (un type présent, un parmi
  plusieurs, aucun, sélection vide, Contenant sans Contenu) et la construction
  des options (dédup, tri, cas vide).
- Le rendu du `MultiSelect` (badges, recherche, combinaison) relève de la
  vérification manuelle, comme les autres éléments purement UI.

## Out of Scope

- Ajout d'un filtre par Type d'article aux autres vues (Demandes, etc.).
- Synchronisation du filtre dans l'URL.
- Modification du comportement des filtres mono-valeur existants.

## Further Notes

- Aucun nouveau terme de glossaire : **Type d'article**, **Contenu** et
  **Contenant** couvrent déjà le concept.
- Aucun ADR : la décision est réversible et n'est pas surprenante.
