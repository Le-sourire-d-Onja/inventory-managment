# Statuts du Contenant, détachement, stock et ajustements divers

Status: resolved

## Problem Statement

Aujourd'hui, la vie d'un Contenant après son rattachement à une Demande est
invisible : il n'existe que « Attribué » ou « En attente », et ni l'empotage ni la
distribution ne sont traçables. Pire, retirer un Contenant d'une Demande le
**supprime définitivement** (avec ses Contenus), et le Stock n'est décrémenté qu'à
la validation d'une Demande — si bien qu'un même Type d'article peut être
attribué deux fois tant que rien n'est validé. À cela s'ajoutent des frictions du
quotidien : les badges de Contenants débordent du tableau des Demandes, on ne
peut pas supprimer un document attaché à une Demande, la recherche des Contenants
ignore le nom de l'Association, les poids et volumes s'affichent avec des
décimales inutiles, et les fenêtres de création/visualisation sont trop étroites.

## Solution

Rendre le cycle de vie du Contenant explicite et réversible, et déplacer la
consommation du Stock au moment de l'Attribution :

- Le Statut du Contenant devient **En attente**, **Attribué**, **Empoté** ou
  **Distribué**, dérivé du rattachement à une Demande et de deux dates
  (`containerized_at`, `distributed_at`). Des boutons « Empoter » puis
  « Distribuer » apparaissent en fin de ligne du tableau des Contenants.
- Retirer un Contenant d'une Demande le **détache** (retour à En attente, Contenus
  conservés, Stock restitué) au lieu de le supprimer ; un Contenant Empoté ou
  Distribué ne peut plus être détaché.
- Un Type d'article quitte le Stock **dès qu'un Contenant qui le porte est
  attribué** (la disponibilité est contrôlée à l'attribution, et revérifiée à la
  validation).
- Confort : les badges de Contenants passent à la ligne, la recherche des
  Contenants couvre le nom de l'Association, un document de Demande peut être
  supprimé, poids/volume s'affichent sans décimale et la Valeur avec 2 décimales,
  et les fenêtres de création/visualisation s'élargissent.

## User Stories

**Statut du Contenant**

1. En tant que gestionnaire, je veux voir si un Contenant est En attente, Attribué, Empoté ou Distribué, afin de connaître son état réel d'un coup d'œil.
2. En tant que gestionnaire, je veux qu'un Contenant devienne Attribué dès qu'il est rattaché à une Demande, afin de ne pas avoir à le marquer manuellement.
3. En tant que gestionnaire, je veux un bouton « Empoter » sur une ligne de Contenant Attribué, afin d'enregistrer que ses Contenus sont conditionnés.
4. En tant que gestionnaire, je veux un bouton « Distribuer » sur une ligne de Contenant Empoté, afin d'enregistrer sa remise à l'Association.
5. En tant que gestionnaire, je veux que le bouton « Empoter » n'apparaisse pas sur un Contenant En attente ou Empoté, afin d'éviter les actions impossibles.
6. En tant que gestionnaire, je veux que le bouton « Distribuer » n'apparaisse pas avant que le Contenant soit Empoté, afin de respecter l'ordre des opérations.
7. En tant que gestionnaire, je veux qu'aucun retour en arrière ne soit possible (Empoté → Attribué, Distribué → Empoté), afin que la traçabilité reste fiable.
8. En tant que gestionnaire, je veux que l'empotage soit possible même si la Demande n'est pas encore Validée, afin de ne pas bloquer le terrain.
9. En tant que gestionnaire, je veux qu'empoter ou distribuer ne modifie pas le Stock, afin que seul le rattachement compte.
10. En tant que gestionnaire, je veux que les dates d'empotage et de distribution soient horodatées automatiquement, afin de savoir quand chaque étape a eu lieu.
11. En tant que gestionnaire, je veux voir le libellé « Empoté » (et non « Empotée ») pour un Contenant, afin de ne pas confondre avec le statut de la Demande.
12. En tant que gestionnaire, je veux que le Statut du Contenant soit identique dans le tableau des Contenants et dans le détail d'une Demande, afin d'éviter les contradictions.

**Détachement d'un Contenant**

13. En tant que gestionnaire, je veux retirer un Contenant d'une Demande sans le supprimer, afin de pouvoir le réutiliser ailleurs.
14. En tant que gestionnaire, je veux qu'un Contenant retiré repasse à En attente, afin de le voir comme libre.
15. En tant que gestionnaire, je veux qu'un Contenant retiré conserve ses Contenus, afin de ne pas perdre le travail de conditionnement.
16. En tant que gestionnaire, je veux que les Contenus d'un Contenant retiré repassent dans le Stock, afin que leur disponibilité soit à jour.
17. En tant que gestionnaire, je veux ne pas pouvoir détacher un Contenant Empoté ou Distribué, afin de ne pas effacer un empotage ou une distribution.
18. En tant que gestionnaire, je veux que les dates d'empotage/distribution soient remises à vide quand un Contenant est détaché, afin que son état redevienne cohérent.
19. En tant que gestionnaire, je veux que la suppression d'une Demande détache ses Contenants non Empotés (retour à En attente) au lieu de les détruire, afin de préserver le matériel.
20. En tant que gestionnaire, je veux que les Contenants Empotés/Distribués d'une Demande supprimée gardent leur état, afin de ne pas perdre la trace d'un acte physique.

**Stock**

21. En tant que gestionnaire, je veux qu'un Type d'article quitte le Stock dès qu'un Contenant qui le porte est attribué, afin qu'il ne soit plus disponible pour une autre Demande.
22. En tant que gestionnaire, je veux qu'un Type d'article d'un Contenant libre reste dans le Stock, afin de ne pas décrémenter du matériel non affecté.
23. En tant que gestionnaire, je veux que le détachement d'un Contenant restitue ses Contenus au Stock, afin de pouvoir les réaffecter.
24. En tant que gestionnaire, je veux être empêché d'attribuer plus de Contenus qu'il n'y a de Stock disponible, afin de ne pas créer de stock négatif.
25. En tant que gestionnaire, je veux que la disponibilité soit revérifiée à la validation d'une Demande, afin de rattraper les conflits entre Demande concurrentes.
26. En tant que gestionnaire, je veux que le contrôle de la validation compare le Stock restant augmenté de la consommation propre de cette Demande, afin qu'une Demande ne se bloque pas elle-même.
27. En tant que gestionnaire, je veux que la quantité « disponible » affichée dans les sélecteurs de Contenu reflète le Stock courant, afin de choisir des quantités réalistes.

**Recherche par Association**

28. En tant que gestionnaire, je veux rechercher dans la liste des Contenants par nom d'Association, afin de retrouver les Contenants d'un partenaire.
29. En tant que gestionnaire, je veux continuer à rechercher un Contenant par son identifiant, afin de ne rien perdre.
30. En tant que gestionnaire, je veux que la recherche des Demandes par nom d'Association continue de fonctionner, afin de ne pas régresser.

**Présentation des nombres**

31. En tant que gestionnaire, je veux que les poids s'affichent sans décimale, afin de lire plus vite.
32. En tant que gestionnaire, je veux que les volumes s'affichent sans décimale, afin de lire plus vite.
33. En tant que gestionnaire, je veux que les Valeurs s'affichent avec 2 décimales, afin de garder une précision monétaire.
34. En tant que gestionnaire, je veux que ces formats s'appliquent au tableau de bord, afin d'avoir une présentation homogène.
35. En tant que gestionnaire, je veux que ces formats s'appliquent aux listes de Contenants, de Demandes et de Types d'article, afin d'éviter la disparité actuelle.
36. En tant que gestionnaire, je veux que ces formats s'appliquent aux champs calculés (poids/volume/Valeur) des fenêtres de Contenant et de Demande, afin de lire la même chose partout.
37. En tant que gestionnaire, je veux que la précision stockée et les exports Excel restent inchangés, afin de ne pas altérer les données.

**Fenêtres de création / visualisation**

38. En tant que gestionnaire, je veux des fenêtres de création et de visualisation plus larges, afin de voir les arbres de Contenants/Contenus sans ascenseur horizontal.
39. En tant que gestionnaire, je veux que toutes les fenêtres de données partagent la même largeur, afin d'une présentation cohérente.

**Mise en page des Demandes**

40. En tant que gestionnaire, je veux que les badges de Contenants d'une ligne de Demande passent à la ligne, afin de voir tous les Contenants sans débordement.

**Document d'une Demande**

41. En tant que gestionnaire, je veux supprimer un document attaché à une Demande, afin de remplacer un justificatif erroné.
42. En tant que gestionnaire, je veux qu'une suppression de document prenne effet à l'enregistrement de la Demande, afin de rester cohérent avec le reste de la fenêtre.
43. En tant que gestionnaire, je veux que le fichier supprimé soit effectivement retiré du stockage, afin de ne pas conserver d'orphelins.
44. En tant que gestionnaire, je veux qu'un document puisse être remplacé par un nouveau fichier, afin de corriger un justificatif.

## Implementation Decisions

### Schéma

- Ajouter deux colonnes nullables `containerized_at` et `distributed_at`
  (`DateTime?`) sur `Container`, en miroir de celles déjà présentes sur `Demand`.
- **Aucune** colonne de statut, **aucun** backfill : le Statut du Contenant est
  dérivé. Les lignes existantes sont naturellement En attente/Attribué selon
  `demand_id`.

### Statut du Contenant (dérivation)

Précédence unique :

1. `distributed_at` renseigné → **Distribué**
2. sinon `containerized_at` renseigné → **Empoté**
3. sinon `demand_id` renseigné → **Attribué**
4. sinon → **En attente**

Ce calcul vit dans le DTO de Contenant (là où « Attribué/En attente » est calculé
aujourd'hui) et alimente l'affichage, la colonne Statut et l'export.

### Transitions et API

- Les boutons « Empoter » / « Distribuer » déclenchent une action de Contenant qui
  **horodate côté serveur** (`containerized_at = now` / `distributed_at = now`).
  Le client ne fournit pas de date.
- Le serveur refuse toute transition illégale : Empoter seulement depuis Attribué,
  Distribuer seulement depuis Empoté. Aucun retour arrière.
- La fenêtre d'édition du Contenant n'expose toujours pas ces transitions (elles
  vivent dans le tableau des Contenants, en fin de ligne).

### Rattachement / détachement

- L'attribution (poser `demand_id`) rend le Contenant Attribué et le retire du
  Stock.
- Le détachement (`demand_id = null`) conserve les Contenus, remet
  `containerized_at`/`distributed_at` à `null` et restitue le Stock. Il est refusé
  si le Contenant est Empoté ou Distribué.
- Le service de Demande ne doit plus faire « tout supprimer puis tout recréer » à
  la mise à jour : il faut **détacher** les Contenants retirés et **rattacher**
  les ajoutés, en préservant identité et Contenus.
- Corriger au passage la fenêtre de Demande qui ne recharge pas les Contenants
  déjà liés à l'édition (cause de recréations/destructions silencieuses).

### Stock

- La requête d'agrégation du Stock doit soustraire les Contenus dont le Contenant
  a **un `demand_id` non nul**, quel que soit le statut de la Demande (aujourd'hui
  elle filtre sur le statut `VALIDATED`). Un Contenant libre ne décrémente rien.
- Contrôle de disponibilité **à l'attribution** : l'ajout/le rattachement d'un
  Contenu ne doit pas dépasser le Stock disponible ; ce contrôle se rejoue à
  chaque (ré)attribution.
- Le contrôle de validation de Demande (bouton Valider) est conservé mais
  recalibré : il compare le Stock restant **augmenté de la consommation propre de
  la Demande** à ses besoins, pour ne pas se bloquer soi-même.

### Formatage des nombres

- Introduire des formateurs partagés : poids et volume à **0 décimale**, Valeur à
  **2 décimales** (le formateur euro actuel fait déjà 2 décimales).
- Appliquer aux affichages : tableau de bord, listes Contenants / Demandes / Types
  d'article, champs calculés des fenêtres.
- Ne pas toucher à la précision stockée ni aux exports Excel.

### Fenêtres et mise en page

- Élargir toutes les fenêtres de données à une largeur commune plus grande (de
  `sm:max-w-lg` vers `sm:max-w-3xl`).
- Passer la colonne de badges de Contenants du tableau des Demandes en
  multi-lignes (`flex-wrap`).

### Recherche

- La recherche de la liste des Contenants doit porter sur le nom de l'Association
  (aujourd'hui uniquement l'identifiant), en plus de l'identifiant.

### Document

- Ajouter un bouton de suppression à côté du document existant dans la fenêtre de
  Demande ; à l'enregistrement, envoyer `document: null` pour que le service
  supprime l'objet du stockage.
- Le service gère déjà ce chemin (suppression S3 quand `document === null`) ; il
  faut le relier à l'UI.

### Décision d'architecture

Cette conception est enregistrée dans `ADR-0002` : Empoté/Distribué sont portés
par le **Contenant**, dérivés de deux dates, et non par la Demande.

## Testing Decisions

- **Ce qui fait un bon test** : n'observer que le comportement externe de
  l'application — les requêtes et les réponses de l'API — jamais les détails
  d'implémentation (nom des fonctions internes, requêtes Prisma exactes, classes
  CSS). Un test doit casser quand le comportement change, pas quand on
  refactore.
- **Couture principale** : les *route handlers* de l'API, appelés directement
  comme fonctions avec une `NextRequest` construite. L'authentification vivant
  dans le middleware (non invoquée en test direct), aucun jeton n'est nécessaire.
  Base Postgres réelle via le `docker-compose` existant, sur une base de test
  dédiée, semée par Prisma.
- **Modules couverts par cette couture** :
  - Demandes : détachement (unlink, Contenus conservés, dates remises à vide,
    refus si Empoté/Distribué), suppression de Demande (set-null des Contenants
    non Empotés), suppression de document.
  - Contenants : transitions de statut (Attribué → Empoté → Distribué, refus des
    transitions illégales et des retours arrière), dérivation du statut.
  - Stock : agrégation (décrément dès l'attribution, Contenant libre non
    décrémenté, restitution au détachement, contrôle de disponibilité).
- **Couture secondaire** : les formateurs d'affichage (poids/volume à 0 décimale,
  Valeur à 2 décimales) — fonctions pures, testées unitairement.
- **Antériorité** : le dépôt ne contient **aucun** test ni outil de test. Il faut
  donc introduire l'infrastructure minimale (Vitest + une base de test). Aucun
  test existant à imiter ; les nouveaux tests fondent le style.

## Out of Scope

- Les statuts `CONTAINERIZED`/`DISTRIBUTED` au niveau de la **Demande** restent
  dormants et sans bouton ; aucune agrégation du statut de Demande à partir des
  Contenants.
- Recherche multi-champs au-delà du nom d'Association sur les Contenants.
- Modification des formats d'export Excel.
- Modification de la précision stockée (poids/volume/Valeur restent des flottants).
- Tests end-to-end / visuels des éléments purement UI (retour à la ligne, largeur
  des fenêtres, emplacement des boutons, recherche) : vérification manuelle.
- Refonte de l'authentification ou du middleware.

## Further Notes

- Le glossaire a été mis à jour : **Statut du contenant** (En attente, Attribué,
  Empoté, Distribué, dérivé), **Attribution**, **Empotage**, **Distribution**,
  **Stock** (non rattaché à un Contenant attribué) ; les statuts Empotée/Distribuée
  de la Demande sont marqués réservés.
- **ADR-0002** documente le choix Empoté/Distribué sur le Contenant.
- Un bug latent est corrigé en passant : la fenêtre de Demande ne recharge pas les
  Contenants déjà liés à l'édition, ce qui provoquait des suppressions/recréations
  silencieuses à chaque enregistrement.
- Suppression d'une Demande : les Contenants non Empotés repassent à En attente,
  les Empotés/Distribués perdent le lien mais gardent leur état (la règle FK
  `onDelete: SetNull` reste).
