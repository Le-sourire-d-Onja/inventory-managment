# 06: Suppression d'un document de Demande

**What to build:** Une corbeille apparaît à côté du document existant dans la fenêtre de Demande. En cliquant puis en enregistrant, la Demande est mise à jour sans document, et le fichier est réellement retiré du stockage. Le remplacement d'un document par un nouveau fichier continue de fonctionner.

**Blocked by:** 01 (Harnais de tests).

**Status:** resolved

- [x] Un bouton de suppression apparaît à côté du document quand la Demande en a un.
- [x] Cliquer puis enregistrer retire le document (lien disparu) et supprime l'objet du stockage.
- [x] Un document peut toujours être remplacé par un nouveau fichier.
- [x] Le chemin de suppression côté service (document à `null`) est relié à l'interface.
- [x] Le comportement est couvert par des tests sur les route handlers.

## Comments

Résolu. Corbeille à côté du document existant dans la fenêtre de Demande; à
l'enregistrement `document: null` retire le lien et supprime l'objet du
stockage; le remplacement par un nouveau fichier fonctionne toujours. Commits:
`b2a8a07` (fusion `8626902`). Tests: `tests/demand-document.test.ts`.
