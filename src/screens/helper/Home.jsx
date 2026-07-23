import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import PinCard from '../../components/PinCard';
import { boardTasks } from '../../data/mockData';
import { EmptyState, ErrorState, LoadingState, SuccessState, SkeletonPage } from '../../components/ui/PageState';

export default function HelperHome({ onAcceptTask, onGoBookings }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);

  const [available, setAvailable] = useState(true);
  const [accepted, setAccepted] = useState({});
  const [actionState, setActionState] = useState({ open: false, kind: null, taskId: null });

  useEffect(() => {
    const tid = setTimeout(() => {
      const shouldError = Math.random() < 0.06;
      if (shouldError) {
        setStatus('error');
        setErrorMsg('Couldn\'t load nearby tasks.');
      } else {
        setStatus('ready');
      }
    }, 700);
    return () => clearTimeout(tid);
  }, [loadAttempt]);

  const tasks = useMemo(() => boardTasks, []);
  const hasTasks = tasks.length > 0;

  const isAccepted = (id) => !!accepted[id];

  const handleAccept = (task) => {
    if (!available || actionState.kind === 'loading') return;
    const already = isAccepted(task.id);
    if (already) return;

    setActionState({ open: true, kind: 'loading', taskId: task.id });

    setTimeout(() => {
      const shouldError = Math.random() < 0.08;
      if (shouldError) {
        setActionState({ open: true, kind: 'error', taskId: task.id });
        return;
      }
      setAccepted((a) => ({ ...a, [task.id]: true }));
      onAcceptTask?.(task);
      setActionState({ open: true, kind: 'success', taskId: task.id });
    }, 850);
  };

  if (status === 'loading') {
    return (
      <div className="p-5 animate-fade-in">
        <SkeletonPage />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorState
          title="Can't load tasks"
          subtitle={errorMsg}
          onRetry={() => {
            setErrorMsg('');
            setStatus('loading');
            setLoadAttempt((n) => n + 1);
          }}
        />
      </div>
    );
  }

  if (!hasTasks) {
    return (
      <div className="p-5">
        <EmptyState title="No tasks nearby" subtitle="Turn on availability to start receiving tasks." />
      </div>
    );
  }

  const actionView = actionState.open;

  return (
    <div className="p-5">
      {actionView && actionState.kind === 'loading' && (
        <div className="mb-4">
          <LoadingState title="Accepting task\u2026" subtitle="Securing the job for you." />
        </div>
      )}

      {actionView && actionState.kind === 'success' && (
        <div className="mb-4">
          <SuccessState
            title="Task accepted"
            subtitle="You can track it in My Bookings."
            onContinue={() => {
              setActionState({ open: false, kind: null, taskId: null });
              onGoBookings?.();
            }}
          />
        </div>
      )}

      {actionView && actionState.kind === 'error' && (
        <div className="mb-4">
          <ErrorState
            title="Acceptance failed"
            subtitle="This task was taken by another helper."
            onRetry={() => setActionState({ open: false, kind: null, taskId: null })}
            retryLabel="OK"
          />
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-[26px] leading-snug font-display font-semibold mb-2">{t('heroHelperTitle')}</h1>
        <p className="text-ink-soft text-[14.5px] leading-relaxed">{t('heroHelperSub')}</p>
      </div>

      <div className="flex justify-between items-center bg-paper-card border border-line rounded-card px-4 py-3.5 mb-5 shadow-card">
        <div>
          <h4 className="text-sm font-semibold mb-0.5">{t('availability')}</h4>
          <p className="text-xs text-ink-soft m-0">{t('availabilitySub')}</p>
        </div>
        <button
          onClick={() => setAvailable((a) => !a)}
          className={`w-[42px] h-6 rounded-full relative transition-colors ${available ? 'bg-banyan' : 'bg-line'}`}
          aria-label="Toggle availability"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              available ? 'translate-x-[18px]' : ''
            }`}
          />
        </button>
      </div>

      <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold mb-2.5 font-mono">
        {t('tasksNearYou')}
      </div>

      <div>
        {tasks.map((task) => (
          <PinCard
            key={task.id}
            task={{ ...task, status: isAccepted(task.id) ? 'progress' : task.status }}
            actionLabel={isAccepted(task.id) ? t('acceptedBtn') : t('acceptBtn')}
            actionDisabled={!available || isAccepted(task.id) || actionState.kind === 'loading'}
            onAction={() => handleAccept(task)}
          />
        ))}
      </div>
  );
}
