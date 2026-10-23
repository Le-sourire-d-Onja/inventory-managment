# Annulation d'un empotage ou d'une distribution

Statut : accepté. Remplace la conséquence « aucun retour arrière » de l'ADR-0003.

Un acte (Empotage ou Distribution) peut être **annulé**, un cran à la fois :
annuler la Distribution efface `distributed_at` et remet le Contenant Empoté ;
annuler l'Empotage efface `containerized_at` et le remet Attribué. L'annulation ne
saute jamais un cran, ne modifie ni le rattachement, ni l'Empaquetage, ni les
Contenus, ni les agrégats, et ne touche pas au Stock. Le Statut de la Demande,
dérivé, recule automatiquement.

## Pourquoi

L'ADR-0002 puis l'ADR-0003 avaient rendu les actes définitifs pour préserver la
traçabilité : un Contenant Empoté ou Distribué ne pouvait être ni détaché ni
supprimé. Le terrain a montré le coût de cette règle : un mauvais Contenant
empoté ou distribué ne pouvait plus être corrigé, et le seul recours était de
supprimer la Demande — ce qui laisse des Contenants datés sans Association sans
corriger l'acte.

Le statut étant dérivé de deux dates, annuler un acte se réduit à effacer la date
correspondante. Aucun état stocké n'est à désynchroniser, et le Stock, qui dépend
du seul rattachement, reste inchangé.

## Options rejetées

- **Retour libre à n'importe quel état antérieur**, y compris En attente : le
  même geste mélangerait annulation d'acte et détachement, avec restitution du
  Stock. Ce sont deux décisions distinctes ; le détachement reste une action à
  part, disponible une fois le Contenant revenu à Attribué.
- **Table d'historique en ajout seul** : coûteuse (migration, écran) pour un
  besoin non exprimé. La décision est réversible plus tard sans casser le modèle.
- **Refuser l'annulation d'un Contenant daté sans Demande** : cet état existe déjà
  (suppression d'une Demande, FK `SetNull`) et le blocage obligerait une action
  sans rapport pour débloquer le bouton.
- **Correction manuelle en base** : hors de portée du terrain, et sans garde-fou.

## Conséquences

- La conséquence de l'ADR-0003 « un Contenant Empoté ou Distribué ne peut être ni
  détaché ni supprimé » reste vraie pour le détachement et la suppression
  directs ; l'acte peut désormais être annulé explicitement, puis le Contenant
  détaché.
- Le Statut d'une Demande peut reculer (Distribuée → Empotée → En attente). C'est
  voulu : il reflète l'état réel après correction.
- L'annulation efface la date d'origine sans la conserver : la confirmation
  utilisateur doit le dire explicitement.
- Les contournements existants sont refermés : un Contenant daté ne peut plus
  changer de rattachement via l'édition ni être rattaché à une autre Demande, et
  un PATCH de Contenant sans `contents` ne vide plus ses Contenus.
- Le glossaire ajoute **Annulation** et précise qu'Empotage et Distribution sont
  réversibles par elle.
