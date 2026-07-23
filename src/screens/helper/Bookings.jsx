import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import PinCard from '../../components/PinCard';
import { EmptyState, ErrorState, LoadingState, SkeletonPage } from '../../components/ui/PageState';

export default function HelperBookings({ bookings, goDetail, goHome }) {
  const { t } = useLanguage();

  const [status, setStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);

  const list = useMemo(() => bookings ?? [], [bookings]);
  const hasBookings = list.length > 0;

  useEffect(() => {
    const tid = setTimeout(() => {
      const shouldError = Math.random() < 0.06;
      if (shouldError) {
        setStatus('error');
        setErrorMsg("Couldn't load your bookings.");
      } else {
        setStatus('ready');
      }
    }, 650);
    return () => clearTimeout(tid);
  }, [loadAttempt]);

  if (status === 'loading') {
    return (
      <div className="p-5 animate-fade-in">
        <div className="h-7 w-44 bg-line/60 rounded-md animate-skeleton-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-paper-card border border-line rounded-2xl p-4 shadow-card">
              <div className="flex justify-between items-start mb-3">
                <div className="h-5 w-20 bg-line/60 rounded-md animate-skeleton-pulse" />
                <div className="h-5 w-16 bg-line/60 rounded-full animate-skeleton-pulse" />
              </div>
              <div className="h-4 w-3/4 bg-line/60 rounded animate-skeleton-pulse mb-3" />
              <div className="h-3 w-1/2 bg-line/60 rounded animate-skeleton-pulse mb-3" />
              <div className="flex items-center justify-between pt-3 border-t border-line/70">
                <div>
                  <div className="h-3 w-12 bg-line/60 rounded animate-skeleton-pulse mb-1" />
                  <div className="h-5 w-16 bg-line/60 rounded animate-skeleton-pulse" />
                </div>
                <div className="h-10 w-24 bg-line/60 rounded-xl animate-skeleton-pulse" />
              </div>
          ))}
        </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <h2 className="text-lg font-display font-semibold mb-4">{t('myBookingsHeading')}</h2>
        <ErrorState
          title="Couldn't load bookings"
          subtitle={errorMsg}
          onRetry={() => {
            setStatus('loading');
            setErrorMsg('');
            setLoadAttempt((n) => n + 1);
          }}
        />
      </div>
    );
  }

  if (!hasBookings) {
    return (
      <div className="p-5">
        <h2 className="text-lg font-display font-semibold mb-4">{t('myBookingsHeading')}</h2>
        <EmptyState
          title="No bookings yet"
          subtitle="Accept a task to start earning."
          cta={
            <button
              onClick={() => goHome?.()}
              className="mt-4 bg-ink text-white px-5 py-3 rounded-lg font-semibold text-sm"
            >
              View tasks
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-5">
      <h2 className="text-lg font-display font-semibold mb-4">{t('myBookingsHeading')}</h2>
      <div>
        {list.map((task) => (
          <PinCard
            key={task.id}
            task={task}
            actionLabel={task.status !== 'done' ? t('detailsBtn') : null}
            onAction={() => goDetail(task)}
            onCardClick={() => goDetail(task)}
          />
        ))}
      </div>
  );
}
