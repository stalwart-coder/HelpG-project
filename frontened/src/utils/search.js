const SERVICE_KEYWORDS = [
  { id: 'iron', keywords: ['iron', 'ironing', 'wash', 'laundry', 'press', 'shirt', 'kurta'] },
  { id: 'vehicle', keywords: ['vehicle', 'car', 'bike', 'auto', 'dzire', 'hyundai'] },
  { id: 'guard', keywords: ['guard', 'security', 'watchman'] },
  { id: 'event', keywords: ['event', 'cook', 'staff', 'wedding', 'cleaning crew', 'catering'] },
];

export function matchServiceFromQuery(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return null;

  for (const { id, keywords } of SERVICE_KEYWORDS) {
    if (keywords.some((k) => q.includes(k))) return id;
  }
  return null;
}

export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return true;
  }
  return false;
}
