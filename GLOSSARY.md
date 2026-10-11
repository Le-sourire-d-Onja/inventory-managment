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

**Conteneur** (hors application):
Le conteneur physique réel, livré, dans lequel les Contenants *Empotés* sont
physiquement déplacés. Non modélisé par l'application : à ne pas confondre avec
Contenant.

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
L'avancement d'une Demande : En attente, Validée. Les valeurs Empotée et
Distribuée existent mais ne sont pas utilisées : l'empotage et la distribution
sont portés par le Contenant (voir Statut du contenant).
_Avoid_: confondre ce statut avec celui du Contenant.

**Statut du contenant**:
L'état d'un Contenant envers les Demandes : En attente (libre), Attribué (rattaché
à une Demande), Empoté (contenus conditionnés) ou Distribué (remis à son
Association). Il est dérivé : on le lit à partir du rattachement et des dates
d'empotage et de distribution, sans statut stocké en double. Distinct du Statut de
la demande.
_Avoid_: en utilisant « En attente » sans préciser s'il s'agit du contenant ou de
la demande.

**Contenant libre**:
Un Contenant non rattaché à une Demande. C'est le statut « En attente » du
Contenant.

**Attribution**:
L'action de rattacher un Contenant à une Demande ; un Contenant attribué est au
statut Attribué.

**Empotage**:
L'action de conditionner les Contenus d'un Contenant attribué ; un Contenant
empoté est au statut Empoté.

**Distribution**:
L'action de remettre un Contenant empoté à son Association ; un Contenant
distribué est au statut Distribué.

**Stock**:
La quantité d'un Type d'article disponible, c'est-à-dire non encore rattachée à
un Contenant attribué.
