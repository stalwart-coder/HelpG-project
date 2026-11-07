import { useState } from 'react';
import { ChevronLeft, MapPin, Plus, X, Search, LocateFixed, Save, Navigation, Loader2, Check } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ErrorState, SuccessState } from '../../components/ui/PageState';

const SUGGESTED_AREAS = [
  'Koramangala, Bengaluru',
  'Indiranagar, Bengaluru',
  'HSR Layout, Bengaluru',
  'Jayanagar, Bengaluru',
  'Whitefield, Bengaluru',
  'MG Road, Bengaluru',
  'Andheri West, Mumbai',
  'Andheri East, Mumbai',
  'Bandra West, Mumbai',
  'Malviya Nagar, Jaipur',
  'Vaishali Nagar, Jaipur',
  'Sector 62, Noida',
  'Sector 18, Noida',
  'Anna Nagar, Chennai',
  'T. Nagar, Chennai',
  'Banjara Hills, Hyderabad',
  'Jubilee Hills, Hyderabad',
  'Viman Nagar, Pune',
  'Koregaon Park, Pune',
  'Salt Lake, Kolkata',
];

export default function ServiceArea({ onBack, onSave }) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedAreas, setSelectedAreas] = useState(['Koramangala, Bengaluru', 'HSR Layout, Bengaluru']);
  const [radius, setRadius] = useState(5);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const searchTrim = search.trim().toLowerCase();
  const filtered = searchTrim
    ? SUGGESTED_AREAS.filter(
        (area) =>
          area.toLowerCase().includes(searchTrim) &&
          !selectedAreas.includes(area)
      )
    : SUGGESTED_AREAS.filter((area) => !selectedAreas.includes(area));

  const addArea = (area) => {
    if (!selectedAreas.includes(area)) {
      setSelectedAreas([...selectedAreas, area]);
    }
    setSearch('');
  };

  const removeArea = (area) => {
    setSelectedAreas(selectedAreas.filter((a) => a !== area));
  };

  const handleSave = () => {
    if (selectedAreas.length === 0) {
      setErrorMsg('Please select at least one service area.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      setStatus('success');
      onSave?.({ areas: selectedAreas, radius });
    } catch (err) {
      setStatus('error');
      setErrorMsg('Could not save service area. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-5">
        <SuccessState
          title="Service area saved"
          subtitle={`${selectedAreas.length} areas configured with ${radius} km radius.`}
          onContinue={onBack}
        />
      </div>
    );
  }

  return (
    <div className="p-5 min-h-screen bg-paper">
      <div className="max-w-lg mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-ink-soft text-sm mb-4"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <h2 className="text-[22px] font-display font-semibold mb-2">Service Area</h2>
        <p className="text-sm text-ink-soft mb-6">
          Select the areas where you want to offer your services. Tasks within
          these areas will be shown to you.
        </p>

        {status === 'error' && errorMsg && (
          <div className="mb-4">
            <ErrorState title="Error" subtitle={errorMsg} onRetry={() => setStatus('idle')} />
          </div>
        )}

        {/* Radius selector */}
        <div className="bg-paper-card border border-line rounded-xl p-5 shadow-card mb-5">
          <div className="flex items-center gap-3 mb-4">
            <Navigation size={20} className="text-marigold-deep" />
            <div>
              <div className="text-sm font-semibold text-ink">Service radius</div>
              <div className="text-xs text-ink-soft">Tasks within this range are shown</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={20}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              disabled={status === 'loading'}
              className="flex-1 accent-marigold-deep disabled:opacity-60"
            />
            <span className="font-mono font-bold text-[18px] min-w-[60px] text-right">
              {radius} km
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-ink-soft mt-1">
            <span>1 km</span>
            <span>20 km</span>
          </div>
        </div>

        {/* Search & add area */}
        <div className="bg-paper-card border border-line rounded-xl p-4 shadow-card mb-5">
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search areas to add..."
              disabled={status === 'loading'}
              className="w-full pl-10 pr-4 py-3 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marigold/40 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    ({ coords }) => {
                      const lat = coords.latitude.toFixed(4);
                      const lng = coords.longitude.toFixed(4);
                      addArea(`Current location (${lat}, ${lng})`);
                    },
                    () => {
                      setErrorMsg('Allow location access to auto-detect your area.');
                    }
                  );
                }
              }}
              disabled={status === 'loading'}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-ink-soft hover:text-ink disabled:opacity-40"
              aria-label="Use current location"
            >
              <LocateFixed size={18} />
            </button>
          </div>

          {/* Selected areas */}
          {selectedAreas.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-semibold text-ink-soft mb-2 font-mono uppercase tracking-wide">
                Selected areas ({selectedAreas.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedAreas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-banyan/10 text-banyan text-xs font-semibold"
                  >
                    <MapPin size={12} />
                    {area}
                    <button
                      type="button"
                      onClick={() => removeArea(area)}
                      disabled={status === 'loading'}
                      className="hover:text-brick disabled:opacity-40"
                      aria-label={`Remove ${area}`}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested areas */}
          <div>
            <div className="text-xs font-semibold text-ink-soft mb-2 font-mono uppercase tracking-wide">
              {searchTrim ? 'Search results' : 'Suggested areas'}
            </div>
            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {filtered.length === 0 ? (
                <p className="text-xs text-ink-soft py-3 text-center">
                  {searchTrim ? 'No matching areas found' : 'All suggested areas added'}
                </p>
              ) : (
                filtered.slice(0, 15).map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => addArea(area)}
                    disabled={status === 'loading'}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-paper text-left disabled:opacity-40"
                  >
                    <MapPin size={16} className="text-ink-soft shrink-0" />
                    <span className="text-sm text-ink flex-1">{area}</span>
                    <Plus size={16} className="text-ink-soft shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-paper-card border border-line rounded-xl p-4 mb-6 flex items-center gap-3">
          <MapPin size={18} className="text-marigold-deep" />
          <div>
            <div className="text-sm font-semibold text-ink">
              {selectedAreas.length} area{selectedAreas.length !== 1 ? 's' : ''} selected
            </div>
            <div className="text-xs text-ink-soft">
              {radius} km radius · Customers within range will find you
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={status === 'loading' || selectedAreas.length === 0}
          className="w-full bg-ink text-white py-3.5 rounded-xl font-bold text-[14.5px] shadow-card hover:shadow-lift transition-all active:scale-[.98] disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {status === 'loading' ? (
            <><Loader2 size={18} className="animate-spin" /> Saving...</>
          ) : (
            <><Save size={18} /> Save service area</>
          )}
        </button>
      </div>
    </div>
  );
}

