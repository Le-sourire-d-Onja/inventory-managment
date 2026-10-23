# 03: Export d'une Association avec ses Données

**What to build:** Un export XLSX multi-feuilles d'une seule Association — fiche
et totaux, Demandes, Contenants, Contenus — déclenché depuis la ligne de
l'Association. Le service d'export apprend à produire plusieurs feuilles sans
changer les exports existants. L'export global des associations reste identique.
Le périmètre est l'Association telle qu'elle est maintenant : Demandes et
Contenants actuellement rattachés.

**Status:** ready-for-agent

- [ ] Le service d'export sait produire un classeur à plusieurs feuilles ; les exports existants restent inchangés.
- [ ] `GET /api/associations/export?id=<uuid>` produit le classeur d'une Association ; sans `id`, le comportement global actuel est conservé.
- [ ] Un `id` inconnu renvoie 404 ; un export valide renvoie le type MIME XLSX.
- [ ] Feuille `Association` : fiche complète puis bloc de totaux (nombre de Demandes, nombre de Contenants, poids, volume, valeur).
- [ ] Feuille `Demandes` : identifiant, Statut dérivé, dates, Document `Oui`/`Non`, nombre de Contenants, poids, volume, valeur, liste des identifiants.
- [ ] Feuille `Contenants` : identifiant, Demande, Statut dérivé, Empaquetage, poids, volume, valeur, date d'empotage, date de distribution.
- [ ] Feuille `Contenus` : Contenant, Demande, Type d'article, quantité, poids/volume/valeur unitaires et de ligne.
- [ ] Dates d'acte en `jj/mm/aaaa hh:mm`, autres dates en `jj/mm/aaaa`.
- [ ] Cellules numériques brutes, sans formatage de chaîne.
- [ ] Nom de fichier `association-<nom-en-ascii>-<aaaammjj>.xlsx`, repli sur l'identifiant.
- [ ] Les Contenants libres ou détachés sont exclus ; une Association sans Demande produit les en-têtes.
- [ ] Icône de téléchargement sur la ligne de l'Association, état de chargement, toast d'erreur.
- [ ] Le bouton global d'export des associations reste inchangé.
- [ ] Tests : codes 200/404, type MIME, noms de feuilles, en-têtes, lignes, totaux, exclusion d'un détaché, cellules numériques, nom de fichier.
