# 03: Export d'une Association avec ses Données

**What to build:** Un export XLSX multi-feuilles d'une seule Association — fiche
et totaux, Demandes, Contenants, Contenus — déclenché depuis la ligne de
l'Association. Le service d'export apprend à produire plusieurs feuilles sans
changer les exports existants. L'export global des associations reste identique.
Le périmètre est l'Association telle qu'elle est maintenant : Demandes et
Contenants actuellement rattachés.

**Status:** resolved

- [x] Le service d'export sait produire un classeur à plusieurs feuilles ; les exports existants restent inchangés.
- [x] `GET /api/associations/export?id=<uuid>` produit le classeur d'une Association ; sans `id`, le comportement global actuel est conservé.
- [x] Un `id` inconnu renvoie 404 ; un export valide renvoie le type MIME XLSX.
- [x] Feuille `Association` : fiche complète puis bloc de totaux (nombre de Demandes, nombre de Contenants, poids, volume, valeur).
- [x] Feuille `Demandes` : identifiant, Statut dérivé, dates, Document `Oui`/`Non`, nombre de Contenants, poids, volume, valeur, liste des identifiants.
- [x] Feuille `Contenants` : identifiant, Demande, Statut dérivé, Empaquetage, poids, volume, valeur, date d'empotage, date de distribution.
- [x] Feuille `Contenus` : Contenant, Demande, Type d'article, quantité, poids/volume/valeur unitaires et de ligne.
- [x] Dates d'acte en `jj/mm/aaaa hh:mm`, autres dates en `jj/mm/aaaa`.
- [x] Cellules numériques brutes, sans formatage de chaîne.
- [x] Nom de fichier `association-<nom-en-ascii>-<aaaammjj>.xlsx`, repli sur l'identifiant.
- [x] Les Contenants libres ou détachés sont exclus ; une Association sans Demande produit les en-têtes.
- [x] Icône de téléchargement sur la ligne de l'Association, état de chargement, toast d'erreur.
- [x] Le bouton global d'export des associations reste inchangé.
- [x] Tests : codes 200/404, type MIME, noms de feuilles, en-têtes, lignes, totaux, exclusion d'un détaché, cellules numériques, nom de fichier.

## Comments

Résolu. `ExportsService.exportSheets` produit un classeur multi-feuilles sans
changer `export` (exports existants mono-feuille intacts). `GET
/api/associations/export` conserve l'export global sans `id` ; avec un `id`
valide il renvoie le classeur `Association`/`Demandes`/`Contenants`/`Contenus`
(nom translittéré, repli sur l'id), 404 si l'id est inconnu ou vide. Le
périmètre exclut les Contenants détachés ; une Association sans Demande garde
les en-têtes. L'icône de ligne a un état de chargement et un toast d'erreur ; le
bouton global est inchangé. Commits : `700cdd8` (fusion `92d226f`) puis
`1fc06f9` (fusion `41dce3e`). Tests : `tests/association-export.test.ts`.
