import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, MapPin, Zap, X } from 'lucide-react';

export default function BoardFilters({
  categories = [],
  localities = [],
  locations = [],
  onChange,
}) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [maxDistance, setMaxDistance] = useState(null); // null or 2 (km)
  const [maxPrice, setMaxPrice] = useState(null);       // null or 500
  const [sortBy, setSortBy] = useState('relevance');

  const safeLocalities = localities.length > 0 ? localities : locations;

  const categoryPills = useMemo(() => {
    const list = [{ id: 'all', label: 'All Tasks', icon: '✨' }];
    categories.forEach((c) => {
      const id = typeof c === 'string' ? c : c.id;
      const label = typeof c === 'string' ? c : c.label || c.name;
      const icon = c.icon || '📌';
      if (id) list.push({ id, label, icon });
    });
    return list;
  }, [categories]);

  const triggerChange = (newCat, newDist, newPrice, newSort, newSearch) => {
    onChange?.({
      search: (newSearch !== undefined ? newSearch : search).trim(),
      category: newCat !== undefined ? newCat : selectedCat,
      maxPrice: newPrice !== undefined ? newPrice : maxPrice,
      maxDistance: newDist !== undefined ? newDist : maxDistance,
      sortBy: newSort !== undefined ? newSort : sortBy,
    });
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    triggerChange(undefined, undefined, undefined, undefined, val);
  };

  const handleCatSelect = (catId) => {
    setSelectedCat(catId);
    triggerChange(catId, undefined, undefined, undefined, undefined);
  };

  const toggleMaxDist = () => {
    const next = maxDistance === 2 ? null : 2;
    setMaxDistance(next);
    triggerChange(undefined, next, undefined, undefined, undefined);
  };

  const toggleMaxPrice = () => {
    const next = maxPrice === 500 ? null : 500;
    setMaxPrice(next);
    triggerChange(undefined, undefined, next, undefined, undefined);
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    triggerChange(undefined, undefined, undefined, val, undefined);
  };

  const handleReset = () => {
    setSearch('');
    setSelectedCat('all');
    setMaxDistance(null);
    setMaxPrice(null);
    setSortBy('relevance');
    onChange?.({
      search: '',
      category: 'all',
      maxPrice: null,
      maxDistance: null,
      sortBy: 'relevance',
    });
  };

  const hasActiveFilters = search || selectedCat !== 'all' || maxDistance != null || maxPrice != null || sortBy !== 'relevance';

  return (
    <div className="mb-6 space-y-3.5">
      {/* ── Top Bar: Search + Sort + Reset ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div
          className="relative flex-1 flex items-center rounded-2xl px-4 py-2.5 transition-all"
          style={{
            background: 'var(--hj-paper-card)',
            border: '1.5px solid var(--hj-line)',
            boxShadow: 'var(--hj-shadow-card)',
          }}
        >
          <Search size={16} style={{ color: 'var(--hj-ink-muted)' }} className="shrink-0 mr-2.5" />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by task title, locality, or keyword..."
            className="w-full bg-transparent outline-none text-sm placeholder:text-[var(--hj-ink-muted)]"
            style={{ color: 'var(--hj-ink)', fontFamily: 'DM Sans, sans-serif' }}
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="p-1 text-xs rounded-full hover:bg-black/10 dark:hover:bg-white/10"
              style={{ color: 'var(--hj-ink-muted)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Quick Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-semibold"
            style={{
              background: 'var(--hj-paper-card)',
              border: '1.5px solid var(--hj-line)',
              color: 'var(--hj-ink-soft)',
            }}
          >
            <SlidersHorizontal size={13} style={{ color: '#F4831F' }} />
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-transparent outline-none text-xs font-semibold cursor-pointer"
              style={{ color: 'var(--hj-ink)' }}
            >
              <option value="relevance" className="bg-[var(--hj-paper-card)] text-[var(--hj-ink)]">🔥 Most Relevant</option>
              <option value="distanceAsc" className="bg-[var(--hj-paper-card)] text-[var(--hj-ink)]">📍 Nearest First</option>
              <option value="priceAsc" className="bg-[var(--hj-paper-card)] text-[var(--hj-ink)]">💰 Price: Low to High</option>
              <option value="priceDesc" className="bg-[var(--hj-paper-card)] text-[var(--hj-ink)]">💎 Price: High to Low</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.25)',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Category & Filter Pills Bar ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* Category Pills */}
        {categoryPills.map((c) => {
          const isSelected = selectedCat === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleCatSelect(c.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap
                         transition-all duration-150 active:scale-95 cursor-pointer shrink-0"
              style={{
                background: isSelected ? '#F4831F' : 'var(--hj-paper-card)',
                color: isSelected ? '#FFFFFF' : 'var(--hj-ink-soft)',
                border: isSelected ? '1px solid #F4831F' : '1px solid var(--hj-line)',
                boxShadow: isSelected ? '0 4px 12px rgba(244,131,31,0.25)' : 'var(--hj-shadow-card)',
              }}
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-[1px] h-6 bg-[var(--hj-line)] shrink-0 mx-1" />

        {/* Quick Modifier Badges */}
        <button
          type="button"
          onClick={toggleMaxDist}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap
                     transition-all duration-150 active:scale-95 cursor-pointer shrink-0"
          style={{
            background: maxDistance === 2 ? 'rgba(28,168,156,0.18)' : 'var(--hj-paper-card)',
            color: maxDistance === 2 ? '#1CA89C' : 'var(--hj-ink-soft)',
            border: maxDistance === 2 ? '1.5px solid #1CA89C' : '1px solid var(--hj-line)',
          }}
        >
          <MapPin size={12} />
          <span>Within 2 km</span>
        </button>

        <button
          type="button"
          onClick={toggleMaxPrice}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap
                     transition-all duration-150 active:scale-95 cursor-pointer shrink-0"
          style={{
            background: maxPrice === 500 ? 'rgba(34,197,94,0.18)' : 'var(--hj-paper-card)',
            color: maxPrice === 500 ? '#22C55E' : 'var(--hj-ink-soft)',
            border: maxPrice === 500 ? '1.5px solid #22C55E' : '1px solid var(--hj-line)',
          }}
        >
          <span>Under ₹500</span>
        </button>
      </div>
    </div>
  );
}
