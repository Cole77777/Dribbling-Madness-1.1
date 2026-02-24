/**
 * Format large numbers as K, M, B, T for display.
 * Safe for non-numbers and negatives (treated as 0).
 */
export function formatNumber(num) {
  const n = Number(num);
  if (n !== n || n < 0) return '0';
  const val = Math.floor(n);
  if (val >= 1e12) return (val / 1e12).toFixed(1) + 'T';
  if (val >= 1e9) return (val / 1e9).toFixed(1) + 'B';
  if (val >= 1e6) return (val / 1e6).toFixed(1) + 'M';
  if (val >= 1e3) return (val / 1e3).toFixed(1) + 'K';
  return val.toString();
}
