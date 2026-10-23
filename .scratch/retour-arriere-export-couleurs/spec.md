# Annulation des actes, export d'une Association, couleurs de statut et camemberts

Status: ready-for-agent

## Problem Statement

Quatre manques se cumulent dans le quotidien de la gestion :

- **Les actes sont définitifs.** Un Contenant empoté ou distribué par erreur ne peut
  plus revenir en arrière : ni l'Empotage ni la Distribution ne peuvent être
  corrigés, et un Contenant daté ne peut être ni détaché ni supprimé. Le seul
  recours actuel est de supprimer la Demande, ce qui laisse des Contenants datés
  sans Association et ne corrige pas l'acte lui-même. En plus, les transitions
  avant (Empoter, Distribuer) partent sans aucune confirmation.
- **On ne peut pas extraire les données d'une seule Association.** L'export
  existant produit une ligne par Association ; impossible d'obtenir un document
  contenant ses Demandes, ses Contenants et ses Contenus, alors que c'est la
  demande naturelle d'un partenaire qui veut son récapitulatif.
- **Les statuts ne se lisent pas d'un coup d'œil dans la table des Demandes.** Les
  badges de Contenants y sont tous de la même couleur, alors que leur statut est
  déjà calculé et affiché ailleurs. Et les couleurs de statut sont dupliquées à
  trois endroits, avec un contraste de texte discutable.
- **Le tableau de bord est en partie inutile et incohérent.** Les graphiques
  « Stock par type d'article » et « Contenants par type d'article » ne servent
  plus, et les couleurs des graphiques ne correspondent à aucune couleur de
  l'application.

## Solution

- **Rendre les actes réversibles, un cran à la fois.** Ajouter « Annuler
  l'empotage » (Empoté → Attribué) et « Annuler la distribution » (Distribué →
  Empoté), qui effacent la date de l'acte sans toucher au rattachement, aux
  Contenus ni au Stock. Le Statut de la Demande, dérivé, recule automatiquement.
  Toute transition — avant comme arrière — passe par une confirmation explicite,
  et les refus serveur sont visibles. Les portes dérobées qui permettent
  aujourd'hui de contourner l'interdit (détachement via la route Contenants,
  rattachement d'un Contenant daté, PATCH qui vide les Contenus) sont refermées.
- **Exporter une Association complète** en XLSX multi-feuilles : fiche et totaux,
  Demandes, Contenants, Contenus, depuis une action sur la ligne de
  l'Association.
- **Une seule source de vérité pour les couleurs de statut**, utilisée par tous
  les badges, la barre de progression et les graphiques, avec un texte lisible.
- **Deux camemberts** sur le tableau de bord — Demandes par statut et Contenants
  par statut — avec tooltip, pourcentage, légende permanente et total au centre,
  à la place des deux graphiques de stock supprimés. Les cartes de totaux et les
  exports de stock restent.

## User Stories

**Annulation des actes**

1. En tant que gestionnaire, je veux voir un bouton d'annulation uniquement sur un Contenant Empoté ou Distribué, afin de ne pas proposer une action impossible.
2. En tant que gestionnaire, je veux annuler la distribution d'un Contenant, afin qu'il redevienne Empoté.
3. En tant que gestionnaire, je veux annuler l'empotage d'un Contenant, afin qu'il redevienne Attribué.
4. En tant que gestionnaire, je veux qu'une annulation ne fasse reculer le Contenant que d'un seul cran, afin que chaque acte reste une décision distincte.
5. En tant que gestionnaire, je veux ne pas pouvoir passer directement de Distribué à Attribué en un clic, afin de ne pas confondre annulation de distribution et annulation d'empotage.
6. En tant que gestionnaire, je veux une confirmation avant d'empoter un Contenant, afin d'éviter un acte irréfléchi.
7. En tant que gestionnaire, je veux une confirmation avant de distribuer un Contenant, afin d'éviter de remettre le mauvais colis.
8. En tant que gestionnaire, je veux une confirmation avant d'annuler un acte, afin de ne pas effacer une date par erreur.
9. En tant que gestionnaire, je veux que la confirmation affiche l'identifiant du Contenant, le statut actuel, le statut cible et la conséquence, afin de savoir exactement ce que je fais.
10. En tant que gestionnaire, je veux que la confirmation d'annulation rappelle la date qui sera effacée, afin de mesurer l'irréversibilité de l'effacement.
11. En tant que gestionnaire, je veux que la date de l'acte annulé soit effacée, afin que le statut dérivé redevienne cohérent.
12. En tant que gestionnaire, je veux qu'une annulation conserve les Contenus du Contenant, afin de ne pas perdre le travail de conditionnement.
13. En tant que gestionnaire, je veux qu'une annulation ne modifie pas le Stock, afin que seul le rattachement continue de compter.
14. En tant que gestionnaire, je veux que le Statut de la Demande soit recalculé après une annulation, afin qu'il reflète l'état réel sans double saisie.
15. En tant que gestionnaire, je veux voir immédiatement la Demande repasser En attente ou Empotée après une annulation, afin de constater l'effet.
16. En tant que gestionnaire, je veux pouvoir détacher un Contenant redevenu Attribué, afin de le réaffecter à une autre Demande.
17. En tant que gestionnaire, je veux qu'un Contenant daté sans Demande (Demande supprimée) puisse aussi être annulé, afin de ne pas rester bloqué sur un état hérité.
18. En tant que gestionnaire, je veux qu'annuler l'empotage d'un Contenant sans Demande le fasse retomber En attente, afin que son statut redevienne naturel.
19. En tant que gestionnaire, je veux un message d'erreur visible si l'état a changé entre l'affichage et mon clic, afin de comprendre pourquoi l'action est refusée.
20. En tant que gestionnaire, je veux un retour de succès après chaque transition, afin de savoir que l'action a bien été enregistrée.
21. En tant que gestionnaire, je veux être averti que l'annulation est définitive et sans historique, afin de ne pas la prendre pour une simple modification.
22. En tant que gestionnaire, je veux que les transitions restent centralisées dans le tableau des Contenants, afin de ne pas les disperser dans plusieurs écrans.
23. En tant que gestionnaire, je veux que le détachement d'un Contenant daté via l'édition soit refusé, afin d'être obligé de passer par une annulation explicite.
24. En tant que gestionnaire, je veux qu'un Contenant daté ne puisse pas être rattaché à une autre Demande, afin de ne pas déplacer un acte physique.
25. En tant que gestionnaire, je veux qu'enregistrer un Contenant sans toucher à ses Contenus ne les efface pas, afin de ne pas perdre de données par inadvertance.
26. En tant que gestionnaire, je veux que les dates d'empotage et de distribution restent posées par le serveur, afin qu'elles ne dépendent pas de l'horloge du poste.

**Export d'une Association**

27. En tant que gestionnaire, je veux une action d'export sur la ligne d'une Association, afin d'obtenir son récapitulatif sans quitter la page.
28. En tant que gestionnaire, je veux que cet export soit un fichier XLSX, afin de l'ouvrir dans un tableur.
29. En tant que gestionnaire, je veux quatre feuilles — Association, Demandes, Contenants, Contenus — afin de lire chaque niveau séparément.
30. En tant que gestionnaire, je veux la fiche complète de l'Association sur la première feuille, afin de retrouver ses coordonnées.
31. En tant que gestionnaire, je veux les totaux de l'Association sur cette première feuille, afin d'avoir le récapitulatif en un coup d'œil.
32. En tant que gestionnaire, je veux le nombre de Demandes, de Contenants et les totaux de poids, volume et valeur, afin d'estimer ce qui a été remis.
33. En tant que gestionnaire, je veux la feuille Demandes avec le Statut dérivé, les dates et les totaux par Demande, afin de suivre l'avancement.
34. En tant que gestionnaire, je veux la feuille Contenants avec le Statut dérivé, l'Empaquetage, les agrégats et les dates d'acte, afin de vérifier chaque colis.
35. En tant que gestionnaire, je veux la feuille Contenus avec le Type d'article, la quantité, les valeurs unitaires et les totaux de ligne, afin de détailler le matériel.
36. En tant que gestionnaire, je veux des dates d'acte au format `jj/mm/aaaa hh:mm` et les autres en `jj/mm/aaaa`, afin de garder l'heure de l'empotage et de la distribution.
37. En tant que gestionnaire, je veux une colonne Document en `Oui`/`Non`, afin de ne pas exporter une URL qui expirera.
38. En tant que gestionnaire, je veux des cellules numériques brutes, afin que les sommes fonctionnent dans le tableur.
39. En tant que gestionnaire, je veux un nom de fichier explicite avec le nom de l'Association et la date, afin de retrouver le bon document.
40. En tant que gestionnaire, je veux que l'export ne contienne que les Contenants actuellement rattachés à ses Demandes, afin de ne pas inclure du matériel sorti de son périmètre.
41. En tant que gestionnaire, je veux qu'une Association sans Demande produise quand même un fichier avec les en-têtes, afin de ne pas avoir d'erreur.
42. En tant que gestionnaire, je veux que le bouton global « Exporter les associations » reste inchangé, afin de ne pas régresser.
43. En tant que gestionnaire, je veux un message d'erreur visible si l'export échoue, afin de ne pas rester devant un bouton inerte.
44. En tant que gestionnaire, je veux que l'export soit protégé par l'authentification comme le reste de l'application, afin de ne pas exposer les coordonnées des partenaires.
45. En tant que gestionnaire, je veux que le fichier reflète l'état au moment du clic, afin d'avoir un récapitulatif cohérent.

**Couleurs de statut**

46. En tant que gestionnaire, je veux voir les identifiants des Contenants colorés dans la table Demandes, afin de connaitre leur statut d'un coup d'œil.
47. En tant que gestionnaire, je veux orange pour En attente, vert pour Attribué, bleu pour Empoté et violet pour Distribué, afin de retrouver les couleurs déjà utilisées.
48. En tant que gestionnaire, je veux les mêmes couleurs dans les badges de la table Contenants, de la fenêtre de Demande et de la barre de progression, afin d'éviter les contradictions.
49. En tant que gestionnaire, je veux des badges au texte lisible sur ces fonds pastel, afin de ne pas plisser les yeux.
50. En tant que gestionnaire, je veux les mêmes couleurs en thème clair et sombre, afin que les statuts ne changent pas de sens.
51. En tant que gestionnaire, je veux que les couleurs soient définies à un seul endroit, afin qu'une évolution future ne désynchronise pas les écrans.
52. En tant que gestionnaire, je veux un rendu neutre pour un statut inconnu, afin de ne pas afficher une couleur trompeuse.
53. En tant que gestionnaire, je veux que la carte « Demandes en attente » utilise l'orange du statut, afin qu'elle soit cohérente avec le reste.

**Tableau de bord**

54. En tant que gestionnaire, je veux que « Stock par type d'article » et « Contenants par type d'article » disparaissent, afin de ne plus encombrer la page avec des graphiques inutiles.
55. En tant que gestionnaire, je veux garder les cartes « Stock total » et « Stock empoté », afin de conserver les chiffres utiles.
56. En tant que gestionnaire, je veux garder les deux exports de stock, afin de ne pas perdre une fonctionnalité.
57. En tant que gestionnaire, je veux un camembert « Contenants par statut », afin de voir la répartition des colis.
58. En tant que gestionnaire, je veux que « Demandes par statut » devienne aussi un camembert, afin d'avoir deux graphiques cohérents.
59. En tant que gestionnaire, je veux survoler une part pour voir le statut, le nombre et le pourcentage, afin de lire une valeur précise.
60. En tant que gestionnaire, je veux une légende permanente listant tous les statuts, y compris ceux à zéro, afin de savoir ce qui est absent.
61. En tant que gestionnaire, je veux le total au centre du camembert, afin d'avoir le volume global.
62. En tant que gestionnaire, je veux un message « Aucune donnée » quand la base est vide, afin de ne pas voir un camembert cassé.
63. En tant que gestionnaire, je veux les deux camemberts côte à côte, afin de comparer Demandes et Contenants.
64. En tant que gestionnaire, je veux que les couleurs des parts soient celles des statuts, afin de relier immédiatement graphique et badges.
65. En tant que gestionnaire, je veux des comptes exacts, afin de pouvoir m'y fier.

## Implementation Decisions

### Tokens de statut

- Un module partagé unique définit quatre tokens sémantiques : `waiting`,
  `assigned`, `containerized`, `distributed`, chacun avec une couleur CSS
  (variable globale) et la classe de badge correspondante. Les valeurs reprennent
  la palette `-300` de Tailwind (orange, vert, bleu, violet) et sont identiques en
  clair et en sombre.
- Les libellés restent portés par les DTO, car ils diffèrent selon le genre
  (Empoté / Empotée, Distribué / Distribuée). Seules les couleurs sont
  mutualisées.
- La classe de badge associe le fond au token et un texte foncé
  (`text-foreground`) pour corriger le contraste actuel.
- Le Statut du Contenant expose en plus une clé stable (`waiting`, `assigned`,
  `containerized`, `distributed`) à côté du libellé et de la couleur. Le Statut de
  la Demande se projette sur les mêmes tokens (`IN_PROGRESS` → waiting,
  `CONTAINERIZED` → containerized, `DISTRIBUTED` → distributed).
- La barre de progression segmentée des Demandes consomme les mêmes tokens.
- Les identifiants de Contenants de la table Demandes utilisent le badge du token
  correspondant, en conservant le préfixe `N°`, le tri et la bulle de Contenus.

### Annulation

- L'endpoint d'action de Contenant accepte quatre actions : `containerize`,
  `distribute`, `uncontainerize`, `undistribute`. Les dates sont toujours posées
  ou effacées côté serveur.
- Règles :
  - `containerize` : exige un rattachement et les deux dates nulles.
  - `distribute` : exige `containerized_at` renseigné et `distributed_at` nul.
  - `uncontainerize` : exige `containerized_at` renseigné et `distributed_at`
    nul ; efface uniquement `containerized_at`.
  - `undistribute` : exige `distributed_at` renseigné ; efface uniquement
    `distributed_at` et conserve `containerized_at`.
  - Toute autre combinaison renvoie 409.
- Une annulation ne modifie ni `demand_id`, ni l'Empaquetage, ni les Contenus, ni
  les agrégats. Le Stock ne bouge pas : il dépend uniquement du rattachement.
- Un Contenant daté sans Demande (Demande supprimée) suit les mêmes règles ; une
  fois ses deux dates nulles, il est En attente.
- Le Statut de la Demande et sa date « Depuis le » étant dérivés à la lecture,
  aucune écriture supplémentaire n'est nécessaire.
- Les quatre transitions passent par la fenêtre de confirmation existante, avec
  un texte propre à chacune (identifiant, statut actuel → statut cible,
  conséquence sur le Statut de la Demande, date effacée pour une annulation).
  Les transitions restent dans le tableau des Contenants.
- Les succès et les refus (409) remontent en toast ; le bouton est désactivé
  pendant l'appel.

### Garde-fous de cohérence

- Modifier un Contenant ne peut plus changer `demand_id` s'il est daté, y compris
  pour le mettre à `null` : il faut d'abord annuler. La valeur identique reste
  acceptée.
- Le rattachement d'un Contenant daté à une Demande (création ou mise à jour) est
  refusé en 409.
- Un PATCH de Contenant qui n'envoie pas `contents` laisse les Contenus
  inchangés ; un `contents` fourni, même vide, les remplace.
- L'édition des Contenus d'un Contenant Empoté/Distribué reste permise à ce
  stade.

### Export d'une Association

- Le service d'export gagne la capacité de produire plusieurs feuilles ; les
  exports existants restent mono-feuille et inchangés.
- Contrat HTTP : l'export des Associations accepte un paramètre `id`. Sans `id`,
  le comportement actuel (une ligne par Association) est conservé. Avec un `id`
  inconnu, réponse 404. Avec un `id` valide, réponse XLSX avec un nom de fichier
  `association-<nom-en-ascii>-<aaaammjj>.xlsx` (repli sur l'identifiant si le nom
  ne peut pas être translittéré).
- Feuilles et colonnes :
  - `Association` : fiche (nom, type, personne en charge, adresse, e-mail,
    téléphone, description, dates de création et de mise à jour) puis un bloc
    de totaux (nombre de Demandes, nombre de Contenants, poids, volume, valeur).
  - `Demandes` : identifiant, Statut dérivé, dates, Document (`Oui`/`Non`),
    nombre de Contenants, poids, volume, valeur, liste des identifiants de
    Contenants.
  - `Contenants` : identifiant, identifiant de Demande, Statut dérivé,
    Empaquetage, poids, volume, valeur, date d'empotage, date de distribution.
  - `Contenus` : identifiant de Contenant, identifiant de Demande, Type
    d'article, quantité, poids/volume/valeur unitaires, poids/volume/valeur de
    ligne.
- Les dates d'acte sont formatées `jj/mm/aaaa hh:mm` ; les autres `jj/mm/aaaa`.
- Les nombres sont écrits en cellules numériques brutes, sans formatage de chaîne.
- Périmètre : Demandes de l'Association et leurs Contenants actuellement
  rattachés, quel que soit leur Statut. Les Contenants libres ou détachés sont
  exclus.
- La feuille Association est toujours produite, même sans Demande ; les autres
  feuilles ne contiennent alors que leurs en-têtes.
- Le déclencheur est une icône de téléchargement sur la ligne de l'Association,
  avec état de chargement et toast d'erreur. Le bouton global d'export des
  associations reste inchangé.
- L'authentification reste assurée par le middleware, sans contrôle dans la
  route.

### Tableau de bord

- Les deux cartes de graphiques de stock, leurs sélecteurs d'unité et le code
  d'affichage associé sont supprimés. Les récupérations de stock, les états, les
  cartes de totaux et les deux exports de stock restent.
- « Demandes par statut » devient un donut à trois parts ; « Contenants par
  statut » est un nouveau donut à quatre parts, alimenté par la liste complète
  des Contenants et regroupé par clé de statut.
- Les parts nulles ne sont pas dessinées mais figurent dans la légende avec leur
  compte. La légende est permanente et utilise les tokens de statut.
- Le survol affiche libellé, nombre et pourcentage ; le total est affiché au
  centre du donut ; une base vide affiche « Aucune donnée ».
- Les deux camemberts sont côte à côte sur grand écran et empilés sur petit.
- La carte « Demandes en attente » utilise le token `waiting`.

### Documentation du domaine

- L'ADR-0004 « Annulation d'un empotage ou d'une distribution » remplace la
  conséquence « aucun retour arrière » de l'ADR-0003. Il documente le choix du
  cran unique, l'absence d'historique et le traitement des Contenants datés sans
  Demande.
- Le glossaire ajoute **Annulation** et précise qu'Empotage et Distribution sont
  réversibles par elle.

## Testing Decisions

- **Ce qui fait un bon test** : n'observer que le comportement externe — requêtes
  et réponses des route handlers, contenu du classeur produit — jamais les détails
  d'implémentation (requêtes Prisma exactes, noms de fonctions internes, classes
  CSS).
- **Couture principale** : les route handlers appelés directement avec une
  `NextRequest`, comme dans les tests existants `containers-status`,
  `demand-detach`, `demand-status` et `stocks`. L'authentification n'étant pas
  invoquée en test direct, aucun jeton n'est nécessaire.
- **Annulation et garde-fous** : couvrir les deux annulations heureuses (date
  effacée, autre date conservée, Contenus et Stock intacts), le refus des
  combinaisons illégales (409), l'annulation d'un Contenant daté sans Demande, la
  remontée du Statut de la Demande (Distribuée → Empotée → En attente), le refus
  de changement de rattachement d'un Contenant daté, et la préservation des
  Contenus quand `contents` est absent.
- **Export** : appeler la route avec et sans `id`, vérifier les codes (200, 404),
  le type MIME XLSX, puis charger le classeur avec ExcelJS et inspecter les noms
  de feuilles, les en-têtes, le nombre de lignes, les totaux, l'exclusion d'un
  Contenant détaché, les cellules numériques et le nom de fichier. Aucun test
  d'export n'existe aujourd'hui : ces tests fondent le style.
- **Tokens de statut** : test unitaire pur vérifiant que chaque état dérivé
  (Demande et Contenant) est associé à un token et que la projection des statuts
  de Demande est complète. Antériorité : `utils.test`.
- **Vérification manuelle** : couleurs, contraste, camemberts, légendes,
  tooltips, responsive et fenêtres de confirmation. Le dépôt n'a aucun test de
  rendu et n'en gagne pas ici.

## Out of Scope

- Table d'historique ou d'audit des actes annulés ; l'annulation efface la date
  sans trace.
- Annulation de l'Attribution : elle reste un détachement, désormais possible
  après retour à Attribué.
- Blocage de l'édition des Contenus d'un Contenant Empoté/Distribué.
- Modification des autres exports (associations global, demandes, contenants,
  donations, types d'article, stocks).
- Étiquette PDF et QR codes.
- Variantes sombres spécifiques aux couleurs de statut.
- Tests end-to-end, visuels ou d'accessibilité.
- Refonte des règles du Statut de la Demande ou du Stock.

## Further Notes

- Cette spec rouvre explicitement une décision antérieure : l'ADR-0003 concluait
  qu'un Contenant Empoté/Distribué ne peut être ni détaché ni supprimé « en
  effaçant un acte physique ». L'ADR-0004 conserve l'interdit pour le détachement
  et la suppression directe, mais autorise l'effacement explicite de la date.
- Trois contournements existants sont corrigés au passage et documentés dans
  l'issue correspondante : détachement via la route Contenants, rattachement d'un
  Contenant daté, et PATCH qui vide les Contenus quand `contents` est absent.
- L'ordre d'exécution suit les dépendances : tokens d'abord, puis annulation,
  puis export, puis tableau de bord.
