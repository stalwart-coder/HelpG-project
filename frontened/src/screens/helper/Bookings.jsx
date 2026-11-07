/**
 * Helper Bookings — HelpJi
 * Shows accepted jobs with teal accent (helper role identity)
 * Tabs: Active / Completed / All
 */
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import PinCard from '../../components/PinCard';
import { EmptyState, ErrorState, SkeletonPinCard } from '../../components/ui/PageState';
import { Briefcase, RefreshCw } from 'lucide-react';

const TABS = [
  { id: 'active',    label: 'Active',    statusFn: (s) => ['pending', 'confirmed', 'in_progress'].includes(s) },
  { id: 'completed', label: 'Completed', statusFn: (s) => ['completed', 'done'].includes(s) },
  { id: 'all',       label: 'All',       statusFn: () => true },
];

export default function HelperBookings({ bookings, loading, error, onRetry, goDetail, goHome }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState('active');

  const list = useMemo(() => bookings ?? [], [bookings]);
  const filtered = useMemo(() => {
    const fn = TABS.find((tb) => tb.id === tab)?.statusFn ?? (() => true);
    return list.filter((b) => fn(b.status));
  }, [list, tab]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 animate-fade-in">
        <div className="h-8 w-44 rounded-xl hj-skeleton" />
        <SkeletonPinCard /><SkeletonPinCard /><SkeletonPinCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <h2
          className="text-xl font-extrabold tracking-tight mb-5"
          style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}
        >
          {t('myBookingsHeading')}
        </h2>
        <ErrorState
          title="Couldn't load bookings"
          subtitle={error}
          onRetry={onRetry}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto pb-nav animate-fade-in" data-role="helper">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center"
              style={{ background: 'rgba(28,168,156,0.12)' }}
            >
              <Briefcase size={14} style={{ color: '#1CA89C' }} />
            </div>
            <h1
              className="text-xl sm:text-2xl font-extrabold tracking-tight"
              style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)', letterSpacing: '-0.03em' }}
            >
              {t('myBookingsHeading')}
            </h1>
          </div>
          <p className="text-xs mt-0.5 ml-9" style={{ color: 'var(--hj-ink-muted)' }}>
            {list.filter((b) => ['pending', 'confirmed', 'in_progress'].includes(b.status)).length} active ·{' '}
            {list.length} total
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="scroll-row mb-6">
        {TABS.map((tb) => {
          const count = list.filter((b) => tb.statusFn(b.status)).length;
          const isActive = tab === tb.id;
          return (
            <button
              key={tb.id}
              type="button"
              onClick={() => setTab(tb.id)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px]
                         text-xs font-bold whitespace-nowrap transition-all active:scale-95"
              style={{
                fontFamily: 'Sora, sans-serif',
                background: isActive ? '#1CA89C' : 'var(--hj-line)',
                color: isActive ? 'white' : 'var(--hj-ink-soft)',
                boxShadow: isActive ? '0 3px 8px rgba(28,168,156,0.22)' : 'none',
              }}
            >
              {tb.label}
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--hj-line-strong)',
                  color: isActive ? 'white' : 'var(--hj-ink-muted)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onRetry}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-xs font-semibold"
          style={{ color: 'var(--hj-ink-muted)', background: 'var(--hj-line)', fontFamily: 'DM Sans, sans-serif' }}
        >
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          title={tab === 'active' ? 'No active bookings' : 'No bookings here'}
          subtitle={tab === 'active'
            ? 'Accept a task to start earning.'
            : 'Your accepted jobs will appear here.'}
          cta={
            tab === 'active' && (
              <button
                onClick={() => goHome?.()}
                className="mt-4 px-5 py-3 rounded-xl font-bold text-sm text-white active:scale-95"
                style={{ background: '#1CA89C', fontFamily: 'Sora, sans-serif' }}
              >
                Browse Nearby Tasks
              </button>
            )
          }
        />
      ) : (
        <div className="stagger-children space-y-0">
          {filtered.map((booking) => {
            const task = {
              _id: booking._id,
              id: booking._id,
              cat: booking.category,
              title: booking.title,
              location: booking.location,
              when: booking.scheduledAt ? new Date(booking.scheduledAt).toLocaleString() : '',
              price: booking.price,
              status: booking.status,
              customer: booking.customer || {},
            };
            const canAction = !['completed', 'cancelled'].includes(booking.status);
            return (
              <PinCard
                key={booking._id}
                task={task}
                actionLabel={canAction ? 'View Details' : null}
                onAction={() => goDetail(booking)}
                onCardClick={() => goDetail(booking)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
