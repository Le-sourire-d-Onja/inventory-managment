# 01: Tokens de statut partagés et couleurs cohérentes

**What to build:** Une source unique pour les couleurs des Statuts, consommée par
les badges, la barre de progression, les identifiants de Contenants de la table
Demandes et, plus tard, les camemberts. Quatre tokens sémantiques — `waiting`
(orange), `assigned` (vert), `containerized` (bleu), `distributed` (violet) —
définis comme variables CSS et exposés avec une classe de badge à texte foncé. Le
Statut du Contenant expose une clé stable en plus de son libellé, et le Statut de
la Demande se projette sur les mêmes tokens. Les identifiants de Contenants de la
table Demandes prennent la couleur de leur statut.

**Status:** resolved

- [x] Module partagé exposant, pour chaque token : clé, couleur CSS et classe de badge.
- [x] Variables CSS `--status-*` définies une seule fois, identiques en clair et en sombre, reprenant la palette `-300`.
- [x] Classe de badge à texte foncé (`text-foreground`) pour corriger le contraste.
- [x] Le DTO de Contenant tire sa couleur du module et expose une clé stable (`waiting`, `assigned`, `containerized`, `distributed`).
- [x] Le DTO de Demande tire ses couleurs du module ; `IN_PROGRESS` → waiting, `CONTAINERIZED` → containerized, `DISTRIBUTED` → distributed.
- [x] La barre de progression segmentée de la table Demandes utilise les tokens au lieu de ses couleurs locales.
- [x] Les identifiants de Contenants de la table Demandes utilisent le badge du statut, sans changer le préfixe `N°`, le tri ni la bulle de Contenus.
- [x] Les badges des tables Contenants, du détail de Demande et du sélecteur suivent automatiquement.
- [x] La carte « Demandes en attente » du tableau de bord utilise le token `waiting`.
- [x] Repli neutre pour un statut inconnu.
- [x] Test unitaire : chaque état dérivé obtient un token et la projection des Statuts de Demande est complète.
- [ ] Vérification manuelle du contraste des badges en clair et en sombre.

## Comments

Résolu. `lib/status-tokens.ts` est la source unique (`waiting`, `assigned`,
`containerized`, `distributed`) : variables `--status-*` définies une fois dans
`:root`, identiques en clair et sombre, et classe de badge à `text-foreground`.
`ContainerDto.containerState` expose une clé stable ; `DemandDto.statusData`
projette les trois Statuts de Demande ; la barre de progression, les badges de
Contenants et les identifiants de la table Demandes consomment le module.
Commits : `7da6891` (fusion `9677e39`). Tests : `tests/status-tokens.test.ts`
(7). Reste à vérifier à l'œil : contraste réel en clair/sombre, rendu des badges
`N°` et de la barre.
