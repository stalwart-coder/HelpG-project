import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_MIN_PRICE = '';
const DEFAULT_MAX_PRICE = '';

export default function BoardFilters({
  categories,
  localities,
  initialCategory = 'all',
  initialAvailability = 'all',
  onChange,
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(DEFAULT_MAX_PRICE);
  const [minRating, setMinRating] = useState('');
  const [location, setLocation] = useState('all');
  const [availability, setAvailability] = useState(initialAvailability);
  const [sortBy, setSortBy] = useState('relevance');
  const [statusMessage, setStatusMessage] = useState('Filters apply instantly to local data.');
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const filters = useMemo(() => {
    const minP = minPrice === '' ? null : Number(minPrice);
    const maxP = maxPrice === '' ? null : Number(maxPrice);
    const minR = minRating === '' ? null : Number(minRating);

    return {
      search: search.trim(),
      category,
      minPrice: minP != null && Number.isFinite(minP) ? minP : null,
      maxPrice: maxP != null && Number.isFinite(maxP) ? maxP : null,
      minRating: minR != null && Number.isFinite(minR) ? minR : null,
      location,
      availability,
      sortBy,
    };
  }, [search, category, minPrice, maxPrice, minRating, location, availability, sortBy]);

  const errors = useMemo(() => {
    const next = {};
    const minP = minPrice === '' ? null : Number(minPrice);
    const maxP = maxPrice === '' ? null : Number(maxPrice);
    const minR = minRating === '' ? null : Number(minRating);

    if (minR != null && (!Number.isFinite(minR) || minR < 0 || minR > 5)) {
      next.minRating = 'Rating must be between 0 and 5.';
    }
    if (minP != null && (!Number.isFinite(minP) || minP < 0)) {
      next.minPrice = 'Minimum price must be 0 or more.';
    }
    if (maxP != null && (!Number.isFinite(maxP) || maxP < 0)) {
      next.maxPrice = 'Maximum price must be 0 or more.';
    }
    if (minP != null && maxP != null && Number.isFinite(minP) && Number.isFinite(maxP) && minP > maxP) {
      next.maxPrice = 'Maximum price must be greater than minimum price.';
    }
    return next;
  }, [minRating, minPrice, maxPrice]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setStatusMessage('Fix filter errors to update results.');
      return;
    }
    onChangeRef.current?.(filters);
    setStatusMessage('Filters updated.');
  }, [filters, errors]);

  const resetFilters = () => {
    setSearch('');
    setCategory(initialCategory);
    setMinPrice(DEFAULT_MIN_PRICE);
    setMaxPrice(DEFAULT_MAX_PRICE);
    setMinRating('');
    setLocation('all');
    setAvailability(initialAvailability);
    setSortBy('relevance');
    setStatusMessage('Filters reset.');
  };

  return (
    <div className="bg-paper-card border border-line rounded-card p-4 shadow-card mb-5 transition-shadow duration-300 hover:shadow-card-hover">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-3">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-ink-soft mb-1">Search</label>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            placeholder="Search tasks, helper name…"
            className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/35"
          />
        </div>

        <div className="flex items-end gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="px-3.5 py-2.5 rounded-lg border border-line text-xs font-semibold text-ink-soft hover:bg-paper-card active:scale-[.99]"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => {
              const v = e.target.value;
              setCategory(v);
              onChange?.({ ...filters, category: v });
            }}
            className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/35"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1">Availability</label>
          <select
            value={availability}
            onChange={(e) => {
              const v = e.target.value;
              setAvailability(v);
              onChange?.({ ...filters, availability: v });
            }}
            className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/35"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1">Location</label>
          <select
            value={location}
            onChange={(e) => {
              const v = e.target.value;
              setLocation(v);
              onChange?.({ ...filters, location: v });
            }}
            className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/35"
          >
            <option value="all">All locations</option>
            {localities.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1">Minimum rating</label>
          <input
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            placeholder="e.g. 4.6"
            inputMode="decimal"
            aria-invalid={!!errors.minRating}
            aria-describedby="board-min-rating-error board-filter-status"
            className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/35"
          />
          {errors.minRating && <div id="board-min-rating-error" className="mt-1 text-xs text-rose-600">{errors.minRating}</div>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1">Price (min)</label>
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="₹ min"
            inputMode="numeric"
            aria-invalid={!!errors.minPrice}
            aria-describedby="board-min-price-error board-filter-status"
            className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/35"
          />
          {errors.minPrice && <div id="board-min-price-error" className="mt-1 text-xs text-rose-600">{errors.minPrice}</div>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-soft mb-1">Price (max)</label>
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="₹ max"
            inputMode="numeric"
            aria-invalid={!!errors.maxPrice}
            aria-describedby="board-max-price-error board-filter-status"
            className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/35"
          />
          {errors.maxPrice && <div id="board-max-price-error" className="mt-1 text-xs text-rose-600">{errors.maxPrice}</div>}
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-ink-soft mb-1">Sorting</label>
          <select
            value={sortBy}
            onChange={(e) => {
              const v = e.target.value;
              setSortBy(v);
              onChange?.({ ...filters, sortBy: v });
            }}
            className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/35"
          >
            <option value="relevance">Relevance</option>
            <option value="distanceAsc">Nearest first</option>
            <option value="priceAsc">Price: low to high</option>
            <option value="priceDesc">Price: high to low</option>
            <option value="ratingDesc">Rating: high to low</option>
          </select>
        </div>
      </div>

      <div id="board-filter-status" className={`text-[11.5px] mt-3 ${Object.keys(errors).length ? 'text-rose-600' : 'text-ink-soft'}`} aria-live="polite">
        {statusMessage}
      </div>
    </div>
  );
}

