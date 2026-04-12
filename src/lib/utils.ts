/**
 * Returns a human-readable relative time string, e.g. "2 days ago".
 */
export function formatDistanceToNow(isoDate: string): string {
  const parsed = new Date(isoDate).getTime();
  if (!isoDate || isNaN(parsed) || parsed < 1_000_000_000_000) return "Recently";
  const diff = Date.now() - parsed;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return "Recently";
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}
