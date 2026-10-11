# 07: Fenêtres élargies

**What to build:** Les fenêtres de création et de visualisation des données sont plus larges et partagent une largeur commune, afin de présenter les arbres de Contenants/Contenus sans ascenseur horizontal.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Toutes les fenêtres de données (Demandes, Contenants, Donations, Associations, Types d'article) utilisent une largeur commune plus large.
- [x] La fenêtre de Demande affiche son arbre de Contenants/Contenus sans ascenseur horizontal.
- [x] La disposition reste correcte sur petit écran (limite de largeur mobile conservée).

## Comments

Résolu. `DialogContent` partagé passe à `sm:max-w-3xl` (limite mobile
`max-w-[calc(100%-2rem)]` conservée); toutes les fenêtres de données en
héritent, les dialogues non-données sont repinnés à `sm:max-w-lg`. Commit:
`f8596be` (fusion `42db510`). Largeur: vérification manuelle (hors périmètre
tests, cf. spec).
