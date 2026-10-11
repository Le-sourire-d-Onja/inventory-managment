# 02: Statut du Contenant Empoté / Distribué

**What to build:** Un Contenant affiche l'un de quatre états : En attente, Attribué, Empoté, Distribué. Le rattacher à une Demande le rend Attribué. En fin de ligne du tableau des Contenants, un Contenant Attribué propose « Empoter » et un Contenant Empoté propose « Distribuer » ; l'action horodate l'étape côté serveur et fait avancer l'état. L'empotage reste possible même si la Demande n'est pas Validée. Aucun retour en arrière, et empoter/distribuer ne modifie pas le Stock.

**Blocked by:** 01 (Harnais de tests).

**Status:** ready-for-agent

- [ ] L'état est dérivé, dans cet ordre : `distributed_at` renseigné → Distribué ; sinon `containerized_at` → Empoté ; sinon rattaché à une Demande → Attribué ; sinon En attente.
- [ ] Les boutons apparaissent selon la règle (Attribué → Empoter ; Empoté → Distribuer ; sinon aucun) et uniquement avec les droits d'écriture.
- [ ] « Empoter » pose la date d'empotage côté serveur, « Distribuer » la date de distribution ; la ligne se met à jour.
- [ ] Le serveur refuse d'empoter un Contenant non Attribué, de distribuer un Contenant non Empoté, et tout retour en arrière.
- [ ] Le libellé du statut (« Empoté », pas « Empotée ») est identique dans la liste des Contenants et dans le détail d'une Demande.
- [ ] Le comportement est couvert par des tests sur les route handlers.
