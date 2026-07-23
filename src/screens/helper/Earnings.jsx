import { useEffect, useMemo, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import WalletCard from '../../components/WalletCard';
import TxnRow from '../../components/TxnRow';
import { helperTransactions } from '../../data/mockData';
import { EmptyState, ErrorState, LoadingState, SuccessState } from '../../components/ui/PageState';

function downloadCSV(rows) {
  const header = 'Description,Date,Amount (₹)';
  const lines = rows.map((r) => `"${r.title}","${r.date}",${r.amount}`);
  const csv = [header, ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'helpji-earnings-statement.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function WithdrawModal({ balance, onClose }) {
  const { t } = useLanguage();
  const [upi, setUpi] = useState('');
  const [status, setStatus] = useState('idle'); // idle|loading|success|error
  const [errorMsg, setErrorMsg] = useState('');

  const upiTrim = upi.trim();
  const upiErr =
    !upiTrim
      ? 'UPI ID / phone number is required.'
      : upiTrim.length < 6
        ? 'Enter a valid UPI ID or phone number.'
        : '';

  const canSubmit = !upiErr && status !== 'loading';

  const handleSubmit = () => {
    if (!canSubmit) return;
    setStatus('loading');
    setErrorMsg('');

    setTimeout(() => {
      const shouldError = Math.random() < 0.08;
      if (shouldError) {
        setStatus('error');
        setErrorMsg('Withdraw request failed. Please try again.');
        return;
      }
      setStatus('success');
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40">
      <div className="w-full max-w-[520px] bg-white rounded-t-3xl p-6 pb-10 shadow-lift">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-[17px]">
            {t('withdrawToBank') || 'Withdraw to bank'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-paper-card" disabled={status === 'loading'}>
            <X size={18} />
          </button>
        </div>

        {status === 'success' ? (
          <SuccessState
            title="Withdrawal requested"
            subtitle={`₹${balance} will reach your UPI ID within 24 hours.`}
            onContinue={onClose}
          />
        ) : status === 'error' ? (
          <ErrorState
            title="Withdraw failed"
            subtitle={errorMsg}
            onRetry={() => {
              setStatus('idle');
              setErrorMsg('');
            }}
          />
        ) : (
          <>
            {status === 'loading' ? (
              <div className="mb-3">
                <LoadingState title="Processing withdrawal…" subtitle="Validating your UPI ID." />
              </div>
            ) : null}

            <div className="bg-paper-card border border-line rounded-xl p-4 mb-5 flex justify-between items-center">
              <span className="text-sm text-ink-soft">{t('availableBalance') || 'Available balance'}</span>
              <span className="font-mono font-bold text-[18px]">₹{balance}</span>
            </div>

            <label className="block text-xs font-semibold text-ink-soft mb-1.5">
              {t('upiIdOrPhone') || 'UPI ID or phone number'}
            </label>
            <input
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              placeholder="e.g. ramesh@okaxis or 98290XXXXX"
              disabled={status === 'loading'}
              className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/40 mb-5 disabled:opacity-70"
            />
            {upiErr ? <div className="text-xs text-rose-600 mb-5">{upiErr}</div> : null}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full bg-banyan text-white py-3.5 rounded-xl font-bold text-[14.5px] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" /> Processing
                </span>
              ) : (
                `Withdraw ₹${balance}`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function HelperEarnings() {
  const { t } = useLanguage();
  const [status, setStatus] = useState('loading'); // loading|ready|error
  const [errorMsg, setErrorMsg] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const transactions = useMemo(() => helperTransactions, []);

  const computed = useMemo(() => transactions.reduce((s, x) => s + x.amount, 0), [transactions]);
  const balance = computed > 0 ? computed : 3240;

  useEffect(() => {
    const tid = setTimeout(() => {
      const shouldError = Math.random() < 0.05;
      if (shouldError) {
        setStatus('error');
        setErrorMsg('Couldn’t load earnings right now.');
      } else {
        setStatus('ready');
      }
    }, 650);
    return () => clearTimeout(tid);
  }, [loadAttempt]);

  if (status === 'loading') {
    return (
      <div className="p-5">
        <LoadingState title="Loading earnings…" subtitle="Preparing your wallet summary." />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorState
          title="Earnings unavailable"
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

  const hasTxns = transactions.length > 0;

  return (
    <div className="p-5">
      <h2 className="text-lg font-display font-semibold mb-4">{t('earningsHeading')}</h2>

      <WalletCard
        label={t('walletBalance')}
        amount={balance}
        primaryLabel={t('withdrawBtn')}
        secondaryLabel={t('statementBtn')}
        onPrimary={() => setShowWithdraw(true)}
        onSecondary={() => downloadCSV(transactions)}
      />

      <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold mb-2.5 font-mono">
        Recent earnings
      </div>

      {hasTxns ? (
        <div className="bg-paper-card border border-line rounded-card p-5 shadow-card">
          {transactions.map((txn, i) => (
            <TxnRow key={i} {...txn} />
          ))}
        </div>
      ) : (
        <div className="mt-3">
          <EmptyState title="No transactions" subtitle="Complete tasks to start earning." />
        </div>
      )}

      {showWithdraw && <WithdrawModal balance={balance} onClose={() => setShowWithdraw(false)} />}
    </div>
  );
}
