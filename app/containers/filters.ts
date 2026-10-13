export interface ArticleTypeFilterOption {
  label: string;
  value: string;
}

/**
 * Vrai si le Contenant porte au moins un des Types d'article sélectionnés (OR).
 * Une sélection vide ne restreint rien.
 */
export function matchesAnyArticleType(
  contents: { type: { id: string } }[],
  selectedTypeIds: string[],
): boolean {
  if (selectedTypeIds.length === 0) {
    return true;
  }
  return contents.some((content) => selectedTypeIds.includes(content.type.id));
}

/**
 * Options du filtre par Type d'article : les Types réellement présents dans les
 * Contenants chargés, dédupliqués, triés par nom (locale française). La valeur
 * d'option est l'identifiant stable du Type d'article ; le libellé est son nom.
 */
export function articleTypeFilterOptions(
  containers: { contents: { type: { id: string; name: string } }[] }[],
): ArticleTypeFilterOption[] {
  const nameById = new Map<string, string>();
  for (const container of containers) {
    for (const content of container.contents) {
      nameById.set(content.type.id, content.type.name);
    }
  }

  return [...nameById.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "fr"));
}
