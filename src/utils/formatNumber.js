/**
 * Format large numbers as K, M, B, T for display.
 * Uses 2 decimals for millions (1e6–<10M) so e.g. 1.49M vs 1.50M is clear and the shown price matches what you need.
 * Safe for non-numbers and negatives (treated as 0).
 */
export function formatNumber(num) {
  const n = Number(num);
  if (n !== n || n < 0) return '0';
  const val = Math.floor(n);
  if (val >= 1e12) return (val / 1e12).toFixed(1) + 'T';
  if (val >= 1e9) return (val / 1e9).toFixed(1) + 'B';
  // 1e6 to <10M: show 3 decimals so 1.499M vs 1.5M is visible (avoids "need 1k more" confusion)
  if (val >= 1e6 && val < 10e6) return (val / 1e6).toFixed(3).replace(/\.?0+$/, '') + 'M';
  if (val >= 1e6) return (val / 1e6).toFixed(1) + 'M';
  if (val >= 1e3) return (val / 1e3).toFixed(1) + 'K';
  return val.toString();
}
