import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import WalletCard from '../../components/WalletCard';
import TxnRow from '../../components/TxnRow';
import { customerTransactions } from '../../data/mockData';
import { EmptyState, ErrorState, LoadingState, SuccessState, SkeletonWalletCard } from '../../components/ui/PageState';

function downloadCSV(rows) {
  if (!rows.length) return false;

  const header = 'Description,Date,Amount (INR)';
  const lines = rows.map((r) => `"${r.title}","${r.date}",${r.amount}`);
  const csv = [header, ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'helpji-payment-history.csv';
  a.click();
  URL.revokeObjectURL(url);
  return true;
}

export default function CustomerWallet({ goPost }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [action, setAction] = useState(null); // null | downloading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const transactions = useMemo(() => customerTransactions, []);
  const totalSpent = transactions
    .filter((x) => x.amount < 0)
    .reduce((s, x) => s + Math.abs(x.amount), 0);

  useEffect(() => {
    const tid = setTimeout(() => {
      const shouldError = Math.random() < 0.04;
      if (shouldError) {
        setStatus('error');
        setErrorMsg('Payment history is unavailable right now.');
        return;
      }
      setStatus('ready');
    }, 600);
    return () => clearTimeout(tid);
  }, [loadAttempt]);

  const handleDownload = () => {
    if (action === 'downloading') return;

    setAction('downloading');
    setTimeout(() => {
      const ok = downloadCSV(transactions);
      setAction(ok ? 'success' : 'error');
      if (!ok) setErrorMsg('There are no payments to download yet.');
    }, 450);
  };

  if (status === 'loading') {
    return (
      <div className="p-5 animate-fade-in">
        <div className="h-7 w-36 bg-line/60 rounded-md animate-skeleton-pulse mb-4" />
        <SkeletonWalletCard />
        <div className="h-4 w-32 bg-line/60 rounded-md animate-skeleton-pulse mb-3" />
        <div className="bg-paper-card border border-line rounded-card p-5 shadow-card">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-line last:border-b-0">
              <div>
                <div className="h-4 w-44 bg-line/60 rounded animate-skeleton-pulse mb-1" />
                <div className="h-3 w-24 bg-line/60 rounded animate-skeleton-pulse" />
              </div>
              <div className="h-4 w-12 bg-line/60 rounded animate-skeleton-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <h2 className="text-lg font-display font-semibold mb-4">{t('paymentsHeading')}</h2>
        <ErrorState
          title="Payments unavailable"
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

  return (
    <div className="p-5">
      <h2 className="text-lg font-display font-semibold mb-4">{t('paymentsHeading')}</h2>

      {action === 'downloading' && (
        <LoadingState title="Preparing download..." subtitle="Generating your payment history CSV." />
      )}
      {action === 'success' && (
        <SuccessState
          title="History downloaded"
          subtitle="Your payment CSV has been generated."
          onContinue={() => setAction(null)}
        />
      )}
      {action === 'error' && (
        <ErrorState
          title="Download failed"
          subtitle={errorMsg}
          onRetry={() => setAction(null)}
          retryLabel="OK"
        />
      )}

      <WalletCard
        label={t('totalSpent')}
        amount={totalSpent}
        primaryLabel={t('newTaskBtn')}
        secondaryLabel={action === 'downloading' ? 'Preparing...' : t('downloadHistory')}
        onPrimary={goPost ? () => goPost(null) : undefined}
        onSecondary={action === 'downloading' ? undefined : handleDownload}
      />

      <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold mb-2.5 font-mono">
        {t('recentPayments')}
      </div>

      {transactions.length > 0 ? (
        <div className="bg-paper-card border border-line rounded-card p-5 shadow-card">
          {transactions.map((txn, i) => (
            <TxnRow key={i} {...txn} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No payments yet"
          subtitle="Post your first task and completed payments will appear here."
          cta={
            <button
              onClick={goPost ? () => goPost(null) : undefined}
              disabled={!goPost}
              className="mt-4 bg-ink text-white px-5 py-3 rounded-lg font-semibold text-sm disabled:opacity-50"
            >
              {t('newTaskBtn')}
            </button>
          }
        />
      )}
    </div>
  );
}
