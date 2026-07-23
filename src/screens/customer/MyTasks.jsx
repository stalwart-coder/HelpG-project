import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import PinCard from '../../components/PinCard';
import { myTasksData } from '../../data/mockData';
import { EmptyState, ErrorState, LoadingState, SuccessState, SkeletonPinCard } from '../../components/ui/PageState';

export default function MyTasks({ goDetail, goRate, goPost }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState('loading'); // loading | error | ready
  const [errorMsg, setErrorMsg] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [actionSuccess, setActionSuccess] = useState(null); // 'rate' | 'track' | null
  const tasks = useMemo(() => myTasksData, []);

  // Simulate fetch
  useEffect(() => {
    const tid = setTimeout(() => {
      const shouldError = Math.random() < 0.06;
      if (shouldError) {
        setStatus('error');
        setErrorMsg('Unable to load your tasks.');
      } else {
        setStatus('ready');
      }
    }, 700);

    return () => clearTimeout(tid);
  }, [loadAttempt]);

  useEffect(() => {
    if (!actionSuccess) return undefined;
    const tid = setTimeout(() => setActionSuccess(null), 1200);
    return () => clearTimeout(tid);
  }, [actionSuccess]);

  const hasTasks = myTasksData.length > 0;

  if (status === 'loading') {
    return (
      <div className="p-5 animate-fade-in">
        <div className="h-7 w-36 bg-line/60 rounded-md animate-skeleton-pulse mb-4" />
        <SkeletonPinCard />
        <SkeletonPinCard />
        <SkeletonPinCard />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <h2 className="text-lg font-display font-semibold mb-4">{t('myTasksHeading')}</h2>
        <ErrorState
          title="Couldn't load tasks"
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

  if (!hasTasks) {
    return (
      <div className="p-5">
        <h2 className="text-lg font-display font-semibold mb-4">{t('myTasksHeading')}</h2>
        <EmptyState
          title={t('emptyTasksTitle')}
          subtitle={t('emptyTasksSub')}
          cta={
            <button
              onClick={() => goPost(null)}
              className="mt-4 bg-ink text-white px-5 py-3 rounded-lg font-semibold text-sm"
            >
              {t('postTaskCta')}
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-5">
      <h2 className="text-lg font-display font-semibold mb-4">{t('myTasksHeading')}</h2>

      {actionSuccess && (
          <SuccessState
            title={actionSuccess === 'rate' ? 'Rating ready' : 'Tracking ready'}
            subtitle={
              actionSuccess === 'rate'
                ? 'We’re opening the rating screen for your completed task.'
                : 'We’re opening the live timeline for your active task.'
            }
            onContinue={() => setActionSuccess(null)}
          />
        )}


      <div className={actionSuccess ? 'opacity-60 pointer-events-none' : undefined}>
        {tasks.map((task) => (
          <PinCard
            key={task.id}
            task={task}
            actionLabel={task.status === 'done' ? t('rateBtn') : t('trackBtn')}
            onAction={task.status === 'done'
              ? () => {
                  setActionSuccess('rate');
                  setTimeout(() => goRate(task), 500);
                }
              : () => {
                  setActionSuccess('track');
                  setTimeout(() => goDetail(task), 500);
                }
            }
          />
        ))}
      </div>
    </div>
  );
}
