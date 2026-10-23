# 01: Tokens de statut partagés et couleurs cohérentes

**What to build:** Une source unique pour les couleurs des Statuts, consommée par
les badges, la barre de progression, les identifiants de Contenants de la table
Demandes et, plus tard, les camemberts. Quatre tokens sémantiques — `waiting`
(orange), `assigned` (vert), `containerized` (bleu), `distributed` (violet) —
définis comme variables CSS et exposés avec une classe de badge à texte foncé. Le
Statut du Contenant expose une clé stable en plus de son libellé, et le Statut de
la Demande se projette sur les mêmes tokens. Les identifiants de Contenants de la
table Demandes prennent la couleur de leur statut.

**Status:** ready-for-agent

- [ ] Module partagé exposant, pour chaque token : clé, couleur CSS et classe de badge.
- [ ] Variables CSS `--status-*` définies une seule fois, identiques en clair et en sombre, reprenant la palette `-300`.
- [ ] Classe de badge à texte foncé (`text-foreground`) pour corriger le contraste.
- [ ] Le DTO de Contenant tire sa couleur du module et expose une clé stable (`waiting`, `assigned`, `containerized`, `distributed`).
- [ ] Le DTO de Demande tire ses couleurs du module ; `IN_PROGRESS` → waiting, `CONTAINERIZED` → containerized, `DISTRIBUTED` → distributed.
- [ ] La barre de progression segmentée de la table Demandes utilise les tokens au lieu de ses couleurs locales.
- [ ] Les identifiants de Contenants de la table Demandes utilisent le badge du statut, sans changer le préfixe `N°`, le tri ni la bulle de Contenus.
- [ ] Les badges des tables Contenants, du détail de Demande et du sélecteur suivent automatiquement.
- [ ] La carte « Demandes en attente » du tableau de bord utilise le token `waiting`.
- [ ] Repli neutre pour un statut inconnu.
- [ ] Test unitaire : chaque état dérivé obtient un token et la projection des Statuts de Demande est complète.
- [ ] Vérification manuelle du contraste des badges en clair et en sombre.

## Comments
