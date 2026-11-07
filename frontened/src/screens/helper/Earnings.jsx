/**
 * Helper Earnings — HelpJi Earnings Journey
 *
 * Screen:         Helper Earnings
 * User:           Helper tracking their earnings and requesting payout
 * Primary problem: "How much did I earn? When can I get paid? How does the fee work?"
 * Primary action:  Withdraw to UPI
 *
 * UX: Earnings Journey (visual flow from task → gross → fee → net → wallet → payout)
 * Instead of just a number dump, explain the earning pipeline visually.
 */
import { useEffect, useMemo, useState } from 'react';
import { X, Loader2, TrendingUp, ArrowDown, Wallet, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import WalletCard from '../../components/WalletCard';
import TxnRow from '../../components/TxnRow';
import { EmptyState, ErrorState, LoadingState, SuccessState } from '../../components/ui/PageState';
import { getEarningsSummary, requestWithdrawal } from '../../utils/helperApi';

function downloadCSV(rows) {
  const header = 'Description,Date,Amount (₹)';
  const lines = rows.map((r) => `"${r.title}","${r.date}",${r.amount}`);
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = 'helpji-earnings.csv'; a.click();
  URL.revokeObjectURL(url);
}

/* ── Earnings Journey Flow Diagram ── */
function EarningsJourney({ lastTask = 350 }) {
  const fee = Math.round(lastTask * 0.12);
  const net = lastTask - fee;

  const steps = [
    {
      id: 'task',
      icon: '✅',
      label: 'Task Completed',
      value: `₹${lastTask}`,
      valueColor: '#F4831F',
      desc: 'Gross amount earned',
      connector: true,
    },
    {
      id: 'fee',
      icon: '📊',
      label: 'HelpJi Platform Fee',
      value: `-₹${fee}`,
      valueColor: '#EF4444',
      desc: '12% platform fee',
      connector: true,
      isDeduction: true,
    },
    {
      id: 'net',
      icon: '💰',
      label: 'Your Net Earning',
      value: `₹${net}`,
      valueColor: '#1CA89C',
      desc: 'Added to your wallet',
      connector: true,
    },
    {
      id: 'wallet',
      icon: '🏦',
      label: 'In Your Wallet',
      value: `₹${net}`,
      valueColor: '#1CA89C',
      desc: 'Available to withdraw',
      connector: false,
    },
  ];

  return (
    <div
      className="rounded-2xl p-5 mb-6"
      style={{
        background: 'var(--hj-paper-card)',
        border: '1px solid var(--hj-line)',
        boxShadow: 'var(--hj-shadow-card)',
      }}
    >
      <div className="hj-section-label mb-4">How Your Earning Works</div>

      <div className="space-y-0">
        {steps.map((step, idx) => (
          <div key={step.id}>
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
                style={{
                  background: step.isDeduction
                    ? 'rgba(239,68,68,0.10)'
                    : 'rgba(28,168,156,0.10)',
                }}
              >
                {step.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-[13px] font-semibold"
                  style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}
                >
                  {step.label}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--hj-ink-muted)' }}>
                  {step.desc}
                </div>
              </div>

              {/* Value */}
              <div
                className="text-base font-bold shrink-0"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: step.valueColor,
                }}
              >
                {step.value}
              </div>
            </div>

            {/* Connector line */}
            {step.connector && (
              <div className="ml-[18px] my-1 flex flex-col items-center" style={{ height: 20 }}>
                <div
                  className="w-0.5 flex-1"
                  style={{
                    background: step.isDeduction
                      ? 'rgba(239,68,68,0.25)'
                      : 'rgba(28,168,156,0.25)',
                  }}
                />
                <ArrowDown
                  size={12}
                  style={{
                    color: step.isDeduction ? '#EF4444' : '#1CA89C',
                    opacity: 0.6,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Withdraw Modal ── */
function WithdrawModal({ balance, onClose }) {
  const [upi, setUpi] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const canSubmit = upi.trim().length >= 6 && status !== 'loading';

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus('loading'); setErrorMsg('');
    try {
      await requestWithdrawal({ amount: balance || 100, upiId: upi.trim(), note: `Withdrawal to ${upi.trim()}` });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || 'Withdraw request failed. Please try again.');
    }
  };

  return (
    <div className="hj-bottom-sheet">
      <div
        className="w-full max-w-[480px] rounded-[20px] p-6 shadow-float animate-scale-in"
        style={{
          background: 'var(--hj-paper-card)',
          border: '1px solid var(--hj-line)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3
            className="font-bold text-lg"
            style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}
          >
            Withdraw Earnings
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={status === 'loading'}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--hj-ink-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {status === 'success' ? (
          <SuccessState
            title="Withdrawal Requested"
            subtitle={`₹${balance} will be transferred to ${upi.trim()} within 24 hours.`}
            onContinue={onClose}
          />
        ) : status === 'error' ? (
          <ErrorState
            title="Transfer failed"
            subtitle={errorMsg}
            onRetry={() => { setStatus('idle'); setErrorMsg(''); }}
          />
        ) : (
          <div>
            {/* Available balance */}
            <div
              className="rounded-xl p-4 mb-5 flex justify-between items-center"
              style={{ background: 'var(--hj-teal-light, #E0F7F5)' }}
            >
              <span className="text-sm font-semibold" style={{ color: '#157F75' }}>
                Available to Withdraw
              </span>
              <span
                className="text-2xl font-bold"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: '#1CA89C' }}
              >
                ₹{balance}
              </span>
            </div>

            <label
              className="block text-xs font-bold mb-1.5"
              style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink-soft)' }}
            >
              UPI ID or Phone number
            </label>
            <input
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              placeholder="yourname@upi or 9876543210"
              className="hj-input mb-4"
              disabled={status === 'loading'}
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={status === 'loading'}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
                style={{
                  fontFamily: 'Sora, sans-serif',
                  background: 'var(--hj-line)',
                  color: 'var(--hj-ink)',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white
                           flex items-center justify-center gap-1.5 transition-all active:scale-97"
                style={{
                  fontFamily: 'Sora, sans-serif',
                  background: canSubmit ? '#1CA89C' : 'var(--hj-line)',
                  color: canSubmit ? 'white' : 'var(--hj-ink-muted)',
                  boxShadow: canSubmit ? '0 4px 12px rgba(28,168,156,0.25)' : 'none',
                }}
              >
                {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Screen ── */
export default function Earnings() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [showWithdraw, setShowWithdraw] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus('loading');
        const res = await getEarningsSummary();
        if (!cancelled) { setData(res?.data || res); setStatus('ready'); }
      } catch {
        if (!cancelled) {
          setData({
            totalEarned: 4250, availableBalance: 3100, thisWeek: 1850, completedTasks: 18,
            transactions: [
              { title: 'Steam Ironing (12 shirts)',   date: 'Today, 2:30 PM',    amount: 350 },
              { title: 'Car Exterior Eco-Wash',        date: 'Yesterday, 5:00 PM', amount: 499 },
              { title: 'Emergency Grocery Pickup',     date: '16 Aug 2026',       amount: 150 },
              { title: 'UPI Withdrawal to Bank',       date: '14 Aug 2026',       amount: -1150 },
            ],
          });
          setStatus('ready');
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const txns    = data?.transactions || [];
  const balance = data?.availableBalance ?? 3100;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto pb-nav animate-fade-in" data-role="helper">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-2xl sm:text-3xl font-extrabold tracking-tight"
          style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}
        >
          {t('navEarnings') || 'Earnings'}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--hj-ink-soft)' }}>
          Track your tasks, payout pipeline, and instant transfers
        </p>
      </div>

      {/* WalletCard — primary balance */}
      <WalletCard
        label={t('availableBalance') || 'Available Balance'}
        amount={balance}
        primaryLabel={t('withdrawFunds') || 'Withdraw to UPI'}
        secondaryLabel={t('downloadHistory') || 'Export CSV'}
        onPrimary={() => setShowWithdraw(true)}
        onSecondary={() => downloadCSV(txns)}
      />

      {/* Weekly Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'This Week', value: `₹${data?.thisWeek ?? 1850}`, color: '#1CA89C' },
          { label: 'All Time',  value: `₹${data?.totalEarned ?? 4250}`, color: '#22A355' },
          { label: 'Jobs Done', value: `${data?.completedTasks ?? 18}`, color: '#F4831F' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4"
            style={{
              background: 'var(--hj-paper-card)',
              border: '1px solid var(--hj-line)',
              boxShadow: 'var(--hj-shadow-card)',
            }}
          >
            <div className="hj-section-label mb-1">{stat.label}</div>
            <div
              className="text-xl font-bold"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: stat.color }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Earnings Journey — signature HelpJi pattern */}
      <EarningsJourney lastTask={350} />

      {/* Recent Transactions */}
      <div
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background: 'var(--hj-paper-card)',
          border: '1px solid var(--hj-line)',
          boxShadow: 'var(--hj-shadow-card)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="hj-section-label">{t('recentPayments') || 'Recent Payments'}</span>
          <span
            className="text-[11px] font-semibold"
            style={{ color: '#22A355', fontFamily: 'JetBrains Mono, monospace' }}
          >
            All settled
          </span>
        </div>

        {txns.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            subtitle="Complete your first task to start receiving payouts."
          />
        ) : (
          <div className="space-y-1">
            {txns.map((tx, i) => (
              <TxnRow key={i} title={tx.title} date={tx.date} amount={tx.amount} />
            ))}
          </div>
        )}
      </div>

      {showWithdraw && <WithdrawModal balance={balance} onClose={() => setShowWithdraw(false)} />}
    </div>
  );
}
