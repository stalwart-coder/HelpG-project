/**
 * Customer Home — HelpJi
 *
 * Screen:        Customer Home
 * User:          Customer who needs help with a small local task
 * Primary problem: "What does a person urgently needing local task help see first?"
 * Primary action: Post a task OR track active task
 *
 * Information hierarchy:
 *   1. Active task (if any) — most urgent
 *   2. Smart Composer — "tell us what you need" (conversational entry)
 *   3. Quick categories — fastest path to booking
 *   4. Community trust signals
 *   5. Live nearby tasks board — secondary discovery
 */
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import CategoryGrid from '../../components/CategoryGrid';
import TrustStrip from '../../components/TrustStrip';
import PinCard from '../../components/PinCard';
import BoardFilters from '../../components/BoardFilters';
import { SERVICES, SERVICE_LABELS } from '../../config/services';
import { getMyBookings, getAvailableBookings } from '../../utils/bookingApi';
import { ArrowRight, MapPin, Sparkles, ChevronRight, Plus, Clock, Radio } from 'lucide-react';
import { SkeletonPage, EmptyState } from '../../components/ui/PageState';

/* ── Smart Composer: shows what the AI "understood" as chips ── */
function SmartComposer({ onSubmit }) {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);

  const QUICK_TASKS = [
    { emoji: '👕', label: 'Iron clothes',    hint: '~₹200' },
    { emoji: '🧹', label: 'Clean my room',  hint: '~₹350' },
    { emoji: '🚗', label: 'Car wash',       hint: '~₹299' },
    { emoji: '💊', label: 'Pick medicines', hint: '~₹99'  },
    { emoji: '🛒', label: 'Grocery run',    hint: '~₹120' },
  ];

  const handleGo = () => {
    const text = input.trim();
    if (text) onSubmit({ initialNote: text });
    else onSubmit(null);
  };

  return (
    <div
      className="rounded-2xl p-4 sm:p-5 mb-7"
      style={{
        background: 'var(--hj-paper-card)',
        border: focused ? '1.5px solid #F4831F' : '1px solid var(--hj-line)',
        boxShadow: focused
          ? '0 0 0 4px rgba(244,131,31,0.15), var(--hj-shadow-raised)'
          : 'var(--hj-shadow-card)',
        transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
      }}
    >
      {/* Prompt label */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0"
          style={{ background: 'rgba(244,131,31,0.12)' }}
        >
          <Sparkles size={14} style={{ color: '#F4831F' }} />
        </div>
        <span
          className="text-xs font-semibold"
          style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}
        >
          {t('aiAssistantPrompt') || 'Type what you need in plain words (e.g. "Need 10 shirts steam pressed by 6 PM in Koramangala")'}
        </span>
      </div>

      {/* Text input */}
      <div className="flex items-center gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGo()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="e.g. 15 kapde iron karwane hain…"
          className="flex-1 bg-transparent outline-none text-sm px-1 py-1"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            color: 'var(--hj-ink)',
            fontSize: '0.9375rem',
          }}
        />
        <button
          type="button"
          onClick={handleGo}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm
                     active:scale-95 transition-all cursor-pointer"
          style={{
            fontFamily: 'Sora, sans-serif',
            background: input.trim() ? '#F4831F' : 'var(--hj-paper-warm)',
            color: input.trim() ? 'white' : 'var(--hj-ink-muted)',
            border: `1px solid ${input.trim() ? '#F4831F' : 'var(--hj-line)'}`,
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          <span>{t('aiAssistantBtn') || 'Smart Fill'}</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Quick task chips */}
      <div className="flex gap-2 flex-wrap">
        {QUICK_TASKS.map((qt) => (
          <button
            key={qt.label}
            type="button"
            onClick={() => onSubmit({ initialNote: qt.label })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px]
                       text-xs font-medium active:scale-95 transition-all cursor-pointer"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              background: 'var(--hj-paper-warm)',
              color: 'var(--hj-ink-soft)',
              border: '1px solid var(--hj-line)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(244,131,31,0.10)';
              e.currentTarget.style.borderColor = '#F4831F';
              e.currentTarget.style.color = '#F4831F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--hj-paper-warm)';
              e.currentTarget.style.borderColor = 'var(--hj-line)';
              e.currentTarget.style.color = 'var(--hj-ink-soft)';
            }}
          >
            <span>{qt.emoji}</span>
            <span>{qt.label}</span>
            <span style={{ color: 'var(--hj-ink-muted)', fontSize: '11px' }}>{qt.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Active Task Banner (Consistent High-Contrast Dark Slate) ── */
function ActiveTaskBanner({ booking, onTrack }) {
  const statusMap = {
    in_progress: { label: 'Helper is working', color: '#1CA89C', bg: 'rgba(28,168,156,0.15)' },
    confirmed:   { label: 'Helper on the way', color: '#F4831F', bg: 'rgba(244,131,31,0.15)' },
    pending:     { label: 'Finding your helper', color: '#F4831F', bg: 'rgba(244,131,31,0.15)' },
  };
  const cfg = statusMap[booking.status] || statusMap.pending;

  return (
    <button
      type="button"
      onClick={onTrack}
      className="w-full text-left rounded-2xl p-4 sm:p-5 mb-7 flex items-center justify-between gap-3
                 active:scale-[0.99] transition-all cursor-pointer group"
      style={{
        background: 'linear-gradient(135deg, #1A1A2E 0%, #151528 100%)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      }}
    >
      <div className="flex items-center gap-3.5">
        {/* Live pulse */}
        <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
          <div
            className="animate-ping absolute inset-0 rounded-full opacity-30"
            style={{ background: cfg.color }}
          />
          <div
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-white text-lg shadow-sm"
            style={{ background: cfg.color }}
          >
            ⚡
          </div>
        </div>

        <div>
          <div
            className="text-[11px] font-bold uppercase tracking-wider mb-0.5"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: cfg.color }}
          >
            {cfg.label}
          </div>
          <div
            className="text-sm sm:text-base font-bold text-white leading-snug group-hover:text-saffron-300 transition-colors"
            style={{ fontFamily: 'Sora, sans-serif' }}
          >
            {booking.title}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Clock size={12} style={{ color: 'rgba(255,255,255,0.5)' }} />
            <span className="text-xs text-white/60">
              {booking.location || 'Koramangala 4th Block, Bengaluru'}
            </span>
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-3">
        <div className="text-right">
          <div className="text-[11px] text-white/50">Total</div>
          <div
            className="text-base sm:text-lg font-extrabold text-white"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}
          >
            ₹{booking.totalAmount || booking.price || 350}
          </div>
        </div>
        <ChevronRight size={20} className="text-white/40 group-hover:text-white transition-colors" />
      </div>
    </button>
  );
}

/* ── Main Screen ── */
export default function CustomerHome({ goServiceDetail, goPost, goDetail }) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const [status, setStatus] = useState('loading');
  const [activeBooking, setActiveBooking] = useState(null);
  const [board, setBoard] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    maxPrice: null,
    maxDistance: null,
    sortBy: 'relevance',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [bookingsRes, boardRes] = await Promise.allSettled([
          getMyBookings(),
          getAvailableBookings({ limit: 30 }),
        ]);

        if (!cancelled) {
          // Active booking
          if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.bookings?.length > 0) {
            const active = bookingsRes.value.bookings.find((b) =>
              ['in_progress', 'confirmed', 'pending'].includes(b.status)
            );
            if (active) setActiveBooking(active);
          }

          // Available board
          if (boardRes.status === 'fulfilled') {
            const list = boardRes.value?.bookings ?? [];
            setBoard(list);
          }
        }
      } catch { /* ignore */ }
      finally { if (!cancelled) setStatus('ready'); }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = (filters.search || '').toLowerCase();
    let list = board;

    if (filters.category && filters.category !== 'all') {
      list = list.filter((t) => (t.cat || t.category) === filters.category);
    }
    if (filters.maxPrice != null) {
      list = list.filter((t) => Number(t.price) <= filters.maxPrice);
    }
    if (filters.maxDistance != null) {
      list = list.filter((t) => t.distanceKm == null || Number(t.distanceKm) <= filters.maxDistance);
    }
    if (q) {
      list = list.filter((t) => {
        const hay = [t.title, t.location, t.address, t.cat, SERVICE_LABELS.en?.[t.cat], (SERVICE_LABELS[lang] || SERVICE_LABELS.en)?.[t.cat]]
          .filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      });
    }

    if (filters.sortBy === 'distanceAsc') {
      list = [...list].sort((a, b) => (a.distanceKm || 99) - (b.distanceKm || 99));
    } else if (filters.sortBy === 'priceAsc') {
      list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (filters.sortBy === 'priceDesc') {
      list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return list;
  }, [board, filters, lang]);

  if (status === 'loading') {
    return (
      <div className="w-full py-4">
        <SkeletonPage />
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0];

  return (
    <div className="w-full pb-nav animate-fade-in" data-role="customer">

      {/* ── 1. Greeting + Location ── */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight"
            style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}
          >
            {firstName ? `Namaste, ${firstName}` : 'Find local help'}
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <MapPin size={13} style={{ color: '#F4831F' }} />
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--hj-ink-soft)', fontFamily: 'DM Sans, sans-serif' }}
            >
              {user?.location || 'Koramangala 4th Block, Bengaluru'}
            </span>
          </div>
        </div>

        {/* Post Task FAB (top right) */}
        <button
          type="button"
          onClick={() => goPost(null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm
                     active:scale-95 transition-all shrink-0 cursor-pointer shadow-md hover:shadow-lg"
          style={{
            fontFamily: 'Sora, sans-serif',
            background: '#F4831F',
            color: 'white',
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{t('postTaskCta') || 'Post a Task Now'}</span>
        </button>
      </div>

      {/* ── 2. Active Task Banner (if exists) ── */}
      {activeBooking && (
        <ActiveTaskBanner
          booking={activeBooking}
          onTrack={() => goDetail(activeBooking)}
        />
      )}

      {/* ── 3. Smart Composer — "Tell us what you need" ── */}
      <SmartComposer onSubmit={(pref) => goPost(pref)} />

      {/* ── 4. Quick Services Grid ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span
              className="text-[11px] font-mono font-bold uppercase tracking-wider"
              style={{ color: 'var(--hj-ink-muted)' }}
            >
              POPULAR SERVICES
            </span>
          </div>
          <button
            type="button"
            onClick={() => goPost(null)}
            className="flex items-center gap-1 text-xs font-semibold hover:underline cursor-pointer"
            style={{ color: '#F4831F', fontFamily: 'DM Sans, sans-serif' }}
          >
            <span>All services</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <CategoryGrid onSelect={(catId) => goServiceDetail(catId)} />
      </div>

      {/* ── 5. Trust Signals ── */}
      <div className="mb-8">
        <TrustStrip />
      </div>

      {/* ── 6. Live Local Community Activity Board ── */}
      <div className="mt-10 pt-8 border-t" style={{ borderColor: 'var(--hj-line)' }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span
                className="text-[11px] font-mono font-extrabold uppercase tracking-wider"
                style={{ color: '#22C55E' }}
              >
                LIVE NEIGHBORHOOD ACTIVITY
              </span>
            </div>

            <h2
              className="text-xl sm:text-2xl font-extrabold tracking-tight"
              style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}
            >
              Recent Tasks Near You
            </h2>
            <p
              className="text-xs sm:text-sm mt-1"
              style={{ color: 'var(--hj-ink-soft)', fontFamily: 'DM Sans, sans-serif' }}
            >
              See real micro-tasks being completed by verified helpers in your locality
            </p>
          </div>

          <div
            className="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto flex items-center gap-1.5"
            style={{
              background: 'rgba(244,131,31,0.12)',
              color: '#F4831F',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            <Radio size={13} />
            <span>{filtered.length} Active Tasks</span>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <BoardFilters
          categories={SERVICES}
          locations={LOCALITIES}
          onChange={setFilters}
        />

        {/* Task Cards Grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="📍"
            title="No tasks match your filter criteria"
            subtitle="Try clearing search query or choosing another service category."
            actionLabel="Reset filters"
            onAction={() =>
              setFilters({
                search: '',
                category: 'all',
                maxPrice: null,
                maxDistance: null,
                sortBy: 'relevance',
              })
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
            {filtered.map((task) => (
              <PinCard
                key={task.id}
                task={task}
                onSelect={(id) => goDetail(id)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
