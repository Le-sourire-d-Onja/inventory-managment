/**
 * Tokens sémantiques des Statuts : source unique des couleurs consommée par les
 * badges, la barre de progression et, à terme, les camemberts. Les valeurs
 * pointent vers les variables CSS `--status-*` (palette `-300`, identiques en
 * clair et en sombre), définies dans `app/globals.css`.
 */
export type StatusToken = "waiting" | "assigned" | "containerized" | "distributed";

export interface StatusTokenDefinition {
  key: StatusToken;
  /** Couleur CSS, pour les graphiques et les styles inline. */
  color: string;
  /** Classe de fond seule, pour les segments de la barre de progression. */
  backgroundClass: string;
  /** Classe de badge : fond du token et texte foncé pour rester lisible. */
  badgeClass: string;
}

export const STATUS_TOKENS: Record<StatusToken, StatusTokenDefinition> = {
  waiting: {
    key: "waiting",
    color: "var(--status-waiting)",
    backgroundClass: "bg-status-waiting",
    badgeClass: "bg-status-waiting text-foreground",
  },
  assigned: {
    key: "assigned",
    color: "var(--status-assigned)",
    backgroundClass: "bg-status-assigned",
    badgeClass: "bg-status-assigned text-foreground",
  },
  containerized: {
    key: "containerized",
    color: "var(--status-containerized)",
    backgroundClass: "bg-status-containerized",
    badgeClass: "bg-status-containerized text-foreground",
  },
  distributed: {
    key: "distributed",
    color: "var(--status-distributed)",
    backgroundClass: "bg-status-distributed",
    badgeClass: "bg-status-distributed text-foreground",
  },
};

/** Repli neutre d'un statut inconnu : aucune couleur trompeuse. */
export const NEUTRAL_STATUS = {
  color: "var(--muted)",
  backgroundClass: "bg-muted",
  badgeClass: "bg-muted text-foreground",
} as const;
