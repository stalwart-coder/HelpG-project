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

/**
 * Formats a location value safely for React rendering.
 * Prevents "Objects are not valid as a React child" errors when GeoJSON {type: 'Point', coordinates: [...]} is passed.
 */
export function formatLocation(loc, fallback = 'Koramangala 4th Block, Bengaluru') {
  if (!loc) return fallback;
  if (typeof loc === 'string') return loc.trim() || fallback;
  if (typeof loc === 'object') {
    if (loc.locality && typeof loc.locality === 'string') return loc.locality;
    if (loc.address && typeof loc.address === 'string') return loc.address;
    if (Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
      return `${loc.coordinates[1].toFixed(4)}, ${loc.coordinates[0].toFixed(4)}`;
    }
  }
  return fallback;
}
