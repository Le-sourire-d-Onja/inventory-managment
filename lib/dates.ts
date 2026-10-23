/**
 * Formatage des dates `jj/mm/aaaa` et `jj/mm/aaaa hh:mm`.
 *
 * L'heure est celle du serveur (`getHours`/`getMinutes`) : la spec ne définit
 * aucun fuseau, on conserve donc ce comportement plutôt que d'en introduire un.
 */
function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** `jj/mm/aaaa`, pour les dates qui ne portent pas d'acte. */
export function formatDate(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** `jj/mm/aaaa hh:mm`, pour les dates d'empotage et de distribution. */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
