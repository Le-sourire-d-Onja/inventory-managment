import type { StatusToken } from "@/lib/status-tokens";

/** Statut déclaré d'un graphique : clé de regroupement, libellé et token de couleur. */
export interface StatusCategory {
  key: string;
  label: string;
  token: StatusToken;
}

/** Part calculée d'un statut, toujours présente même quand son compte est nul. */
export interface StatusSegment extends StatusCategory {
  count: number;
  /** Part du total en pourcentage, arrondie au dixième. */
  percentage: number;
}

export interface StatusBreakdown {
  /** Toutes les catégories déclarées, dans leur ordre de déclaration. */
  segments: StatusSegment[];
  total: number;
}

/**
 * Regroupe des éléments par clé de statut et calcule les parts du total.
 *
 * Les catégories déclarées mais absentes des données restent présentes à zéro,
 * ce qui permet une légende permanente. Les clés non déclarées sont ignorées :
 * le total reste la somme exacte des parts affichées.
 */
export function buildStatusBreakdown<T>(
  items: readonly T[],
  categories: readonly StatusCategory[],
  statusKeyOf: (item: T) => string | null | undefined,
): StatusBreakdown {
  const counts = new Map(categories.map((category) => [category.key, 0]));

  for (const item of items) {
    const key = statusKeyOf(item);
    if (key !== null && key !== undefined && counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const total = categories.reduce((sum, category) => sum + (counts.get(category.key) ?? 0), 0);

  return {
    total,
    segments: categories.map((category) => {
      const count = counts.get(category.key) ?? 0;
      return {
        ...category,
        count,
        percentage: total === 0 ? 0 : Math.round((count / total) * 1000) / 10,
      };
    }),
  };
}
