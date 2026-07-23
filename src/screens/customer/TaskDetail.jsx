import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Loader2, X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICE_LABELS } from '../../config/services';
import HelperMini from '../../components/HelperMini';
import Timeline from '../../components/Timeline';
import { EmptyState, ErrorState, LoadingState, SuccessState, SkeletonTaskDetail } from '../../components/ui/PageState';

function EmergencyModal({ onClose, onConfirm, status }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40">
      <div className="w-full max-w-[520px] bg-white rounded-t-3xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-brick flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-[15px]">Emergency / Report issue</h3>
              <p className="text-xs text-ink-soft mt-0.5">Our support team will be notified immediately.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={status === 'loading'}
            className="p-1.5 rounded-full hover:bg-paper-card disabled:opacity-40"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {status === 'success' ? (
          <div className="py-2">
            <SuccessState
              title="Report submitted"
              subtitle="A support agent will contact you within 5 minutes."
              onContinue={onClose}
            />
          </div>
        ) : (
          <>
            <p className="text-sm text-ink-soft mb-5 leading-relaxed">
              Use this only for urgent safety concerns or serious issues during an active task.
              For minor issues, try chatting with your helper first.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={status === 'loading'}
                className="flex-1 py-3 rounded-xl border border-line font-semibold text-sm disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={status === 'loading'}
                className="flex-1 py-3 rounded-xl bg-brick text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Submitting…
                  </>
                ) : (
                  'Submit report'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TaskDetail({ task, onBack }) {
  const { t, lang } = useLanguage();
  const [status, setStatus] = useState('loading'); // loading | ready | empty | error
  const [errorMsg, setErrorMsg] = useState('');
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyStatus, setEmergencyStatus] = useState('idle'); // idle | loading | success

  const resolvedTask = useMemo(() => task, [task]);

  useEffect(() => {
    if (status !== 'loading') return undefined;
    const tid = setTimeout(() => {
      setStatus(resolvedTask ? 'ready' : 'empty');
    }, 250);
    return () => clearTimeout(tid);
  }, [resolvedTask, status]);

  const handleEmergencyConfirm = () => {
    setEmergencyStatus('loading');
    setTimeout(() => {
      setEmergencyStatus('success');
    }, 900);
  };

  const closeEmergency = () => {
    setEmergencyOpen(false);
    setEmergencyStatus('idle');
  };

  if (status === 'loading') {
    return (
      <div className="p-5">
        <SkeletonTaskDetail />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <ErrorState
        title="Couldn't load task"
        subtitle={errorMsg || 'Please try again.'}
        onRetry={() => {
          setErrorMsg('');
          setStatus('loading');
        }}
      />
    );
  }

  if (!resolvedTask) {
    return (
      <EmptyState
        title="No task selected"
        subtitle="Return to your tasks and choose one to track."
        cta={
          onBack ? (
            <button
              onClick={onBack}
              className="mt-4 bg-ink text-white px-5 py-3 rounded-lg font-semibold text-sm"
            >
              Back
            </button>
          ) : null
        }
      />
    );
  }

  const label = SERVICE_LABELS[lang]?.[resolvedTask.cat] ?? SERVICE_LABELS.en[resolvedTask.cat];

  const steps = [
    { label: t('stepPosted'), time: '9:02 AM', state: 'done' },
    { label: `${t('stepMatched')} — ${task.helper || 'Ramesh Kumar'}`, time: '9:14 AM', state: 'done' },
    { label: t('stepOnWay'), time: 'ETA 12 mins', state: task.status === 'progress' ? 'current' : 'done' },
    { label: t('stepInProgress'), time: '', state: 'pending' },
    { label: t('stepCompleted'), time: '', state: 'pending' },
  ];

  return (
    <div className="p-5">
      {onBack && (
        <button onClick={onBack} className="flex items-center gap-1 text-ink-soft text-sm mb-4">
          <ChevronLeft size={16} /> Back
        </button>
      )}
      <h2 className="text-lg font-display font-semibold mb-1">{label}</h2>
      <p className="text-ink-soft text-[13px] mb-4">
        {t('statusLabel')} #{task.id} · {task.location || 'Malviya Nagar'}
      </p>

      <HelperMini
        name={task.helper || 'Ramesh Kumar'}
        initials="RK"
        verified={t('trustAvgRating') ? 'Verified' : ''}
        rating={4.8}
        taskCount={212}
        showChat
      />

      <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold mb-1 font-mono">
        // {t('statusLabel')}
      </div>
      <Timeline steps={steps} />

      <button
        onClick={() => setEmergencyOpen(true)}
        disabled={emergencyOpen}
        className="w-full bg-brick text-white py-3.5 rounded-[10px] font-bold text-[14.5px] mt-2 disabled:opacity-60"
      >
        {t('emergencyBtn')}
      </button>

      {emergencyOpen && (
        <EmergencyModal
          onClose={closeEmergency}
          onConfirm={handleEmergencyConfirm}
          status={emergencyStatus}
        />
      )}
    </div>
  );
}
