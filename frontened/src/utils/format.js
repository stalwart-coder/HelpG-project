/**
 * Formats a number to Indian Rupee format (e.g. 1,23,456)
 * Handles non-finite values gracefully by returning '0'
 */
export function formatINR(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '0';
  try {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num);
  } catch {
    return String(num);
  }
}

