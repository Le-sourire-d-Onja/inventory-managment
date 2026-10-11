# 09: Recherche des Contenants par nom d'Association

**What to build:** La recherche de la liste des Contenants porte sur le nom de l'Association en plus de l'identifiant, afin de retrouver les Contenants d'un partenaire. La recherche des Demandes par nom d'Association continue de fonctionner.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Saisir (une partie de) un nom d'Association dans la liste des Contenants filtre sur les Contenants rattachés à cette Association.
- [x] La recherche par identifiant de Contenant continue de fonctionner.
- [x] La recherche des Demandes par nom d'Association n'est pas régressée.

## Comments

Résolu. La colonne de recherche des Contenants combine identifiant + nom de
l'Association (`${row.id} ${row.association?.name ?? ""}`), l'affichage reste
inchangé; la recherche des Demandes (`searchColumnId="name"`) est intacte.
Commit: `3ca3faa` (fusion `2c7f397`). Comportement: vérification manuelle (hors
périmètre tests, cf. spec).
