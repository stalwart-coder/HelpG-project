/**
 * MyTasks — HelpJi Customer
 * Task list with status filter tabs and Task Pulse chips.
 * Saffron accent, warm card design, clear status hierarchy.
 */
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import PinCard from '../../components/PinCard';
import { EmptyState, ErrorState, SkeletonPinCard } from '../../components/ui/PageState';
import { getMyBookings } from '../../utils/bookingApi';
import { Plus, RefreshCw } from 'lucide-react';

const TABS = [
  { id: 'all',       label: 'All',        statusFn: () => true },
  { id: 'active',    label: 'Active',     statusFn: (s) => ['pending', 'confirmed', 'in_progress', 'open'].includes(s) },
  { id: 'completed', label: 'Completed',  statusFn: (s) => ['completed', 'done'].includes(s) },
  { id: 'cancelled', label: 'Cancelled',  statusFn: (s) => s === 'cancelled' },
];

export default function MyTasks({ goDetail, goRate, goPost }) {
  const { t } = useLanguage();
  const [status, setStatus]       = useState('loading');
  const [errorMsg, setErrorMsg]   = useState('');
  const [loadAttempt, setLoad]    = useState(0);
  const [tab, setTab]             = useState('all');
  const [tasks, setTasks]         = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus('loading');
        const result = await getMyBookings();
        if (!cancelled) { setTasks(result?.bookings || []); setStatus('ready'); }
      } catch (err) {
        if (!cancelled) { setStatus('error'); setErrorMsg(err.message || 'Unable to load bookings.'); }
      }
    })();
    return () => { cancelled = true; };
  }, [loadAttempt]);

  const filtered = useMemo(() => {
    const fn = TABS.find((tb) => tb.id === tab)?.statusFn ?? (() => true);
    return tasks.filter((t) => fn(t.status));
  }, [tasks, tab]);

  if (status === 'loading') {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 animate-fade-in">
        <div className="h-8 w-44 rounded-xl hj-skeleton" />
        <SkeletonPinCard /><SkeletonPinCard /><SkeletonPinCard />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <h1
          className="text-xl sm:text-2xl font-extrabold mb-4"
          style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}
        >
          {t('myTasksHeading')}
        </h1>
        <ErrorState
          title="Could not load tasks"
          subtitle={errorMsg}
          onRetry={() => { setStatus('loading'); setErrorMsg(''); setLoad((n) => n + 1); }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto pb-nav animate-fade-in" data-role="customer">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-xl sm:text-2xl font-extrabold tracking-tight"
            style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)', letterSpacing: '-0.03em' }}
          >
            {t('myTasksHeading')}
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--hj-ink-muted)' }}>
            Track your service requests and timelines
          </p>
        </div>
        <button
          type="button"
          onClick={() => goPost(null)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                     font-bold text-sm text-white active:scale-95 transition-all"
          style={{
            fontFamily: 'Sora, sans-serif',
            background: '#F4831F',
            boxShadow: '0 4px 12px rgba(244,131,31,0.22)',
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          {t('postTaskCta')}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="scroll-row mb-6">
        {TABS.map((tb) => {
          const count = tasks.filter((t) => tb.statusFn(t.status)).length;
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
                background: isActive ? 'var(--hj-ink)' : 'var(--hj-line)',
                color: isActive ? 'white' : 'var(--hj-ink-soft)',
              }}
            >
              {tb.label}
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'var(--hj-line-strong)',
                  color: isActive ? 'white' : 'var(--hj-ink-muted)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}

        {/* Refresh */}
        <button
          type="button"
          onClick={() => setLoad((n) => n + 1)}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-xs font-semibold"
          style={{
            fontFamily: 'DM Sans, sans-serif',
            color: 'var(--hj-ink-muted)',
            background: 'var(--hj-line)',
          }}
        >
          <RefreshCw size={11} />
          Refresh
        </button>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <EmptyState
          title={t('emptyTasksTitle')}
          subtitle={t('emptyTasksSub')}
          cta={
            <button
              onClick={() => goPost(null)}
              className="mt-4 px-6 py-3 rounded-xl font-bold text-sm text-white active:scale-95"
              style={{ background: '#F4831F', fontFamily: 'Sora, sans-serif' }}
            >
              {t('postTaskCta')}
            </button>
          }
        />
      ) : (
        <div className="stagger-children space-y-0">
          {filtered.map((task) => {
            const isDone = ['completed', 'done'].includes(task.status);
            return (
              <PinCard
                key={task._id || task.id}
                task={task}
                actionLabel={isDone ? t('rateBtn') : t('trackBtn')}
                onAction={() => (isDone ? goRate(task) : goDetail(task))}
                onCardClick={() => goDetail(task)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
