# Le Sourire d'Onja — Gestion logistique

Contexte métier de la gestion des dons matériels : des Donations entrent, sont
réparties en Demandes faites par des Associations, puis conditionnées dans des
Contenants.

## Language

**Donation**:
Un ensemble de dons matériels reçus, décrits librement et composés de plusieurs
Articles.

**Type d'article** (ArticleType):
Une catégorie de matériel (nom, poids, volume et valeur unitaires) ; sert à
compter les Articles et les Contenus.
_Avoid_: Article, catégorie, matériel

**Valeur**:
La valeur monétaire unitaire d'un Type d'article, exprimée en euros (€). Elle est
indicative : elle sert à estimer un Stock ou un Contenant, pas à facturer.
_Avoid_: Prix, price, montant, coût, tarif

**Contenant** (Container):
Une unité physique qui regroupe des Contenus et porte un identifiant annuel
(ex. `250001`).
_Avoid_: Conteneur, colis, carton, boîte

**Contenu** (Content):
Une quantité d'un Type d'article placée dans un Contenant.

**Empaquetage** (Packaging):
La façon dont un Contenant est emballé : Carton, Filmé, Ficelé ou Nu.

**Demande** (Demand):
Une requête formulée par une Association, qui porte un Statut de la demande et à
laquelle des Contenants peuvent être rattachés.

**Association**:
L'organisation ou la personne destinataire d'une Demande.

**Statut de la demande**:
L'avancement d'une Demande : En attente, Validée, Empotée, Distribuée.

**Statut du contenant**:
L'état d'un Contenant vis-à-vis des Demandes : Attribué (rattaché à une Demande,
donc à une Association) ou En attente (libre). Distinct du Statut de la demande.
_Avoid_: en utilisant « En attente » sans préciser s'il s'agit du contenant ou de
la demande.

**Contenant libre**:
Un Contenant non rattaché à une Demande. C'est le statut « En attente » du
Contenant.

**Empotage**:
L'action de placer des Contenus dans des Contenants ; une Demande empotée est au
statut Empotée.

**Stock**:
La quantité d'un Type d'article disponible, c'est-à-dire non encore attribuée à
des Contenants d'une Demande validée.
