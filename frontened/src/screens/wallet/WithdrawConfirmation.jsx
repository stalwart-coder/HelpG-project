import { useState } from 'react';
import { ChevronLeft, Banknote, Smartphone, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ErrorState } from '../../components/ui/PageState';
import { requestWithdrawal } from '../../utils/helperApi';

export default function WithdrawConfirmation({ data, onBack, onConfirm }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const { account, amount } = data || {};
  const fee = Math.round(amount * 0.02); // 2% processing fee
  const netAmount = amount - fee;
  const estimatedTime = account?.type === 'upi' ? '5-10 minutes' : '12-24 hours';

  const handleConfirm = async () => {
    setStatus('loading');
    setErrorMsg('');

    try {
      const response = await requestWithdrawal({
        amount: Number(amount),
        upiId: account?.type === 'upi' ? account?.account : undefined,
        note: `Withdrawal to ${account?.label || 'Account'} (${account?.account || ''})`,
      });
      setStatus('success');
      onConfirm?.({ ...data, response });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || 'Withdrawal failed. Please check your balance and try again.');
    }
  };

  if (status === 'success') {
    return null; // Parent handles success screen
  }

  return (
    <div className="p-5 min-h-screen bg-paper">
      <div className="max-w-lg mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-ink-soft text-sm mb-4"
          disabled={status === 'loading'}
        >
          <ChevronLeft size={16} /> Back
        </button>

        <h2 className="text-[22px] font-display font-semibold mb-1">Confirm Withdrawal</h2>
        <p className="text-sm text-ink-soft mb-6">Please review your withdrawal details.</p>

        {status === 'error' && (
          <div className="mb-4">
            <ErrorState title="Withdrawal failed" subtitle={errorMsg} onRetry={() => setStatus('idle')} />
          </div>
        )}

        {status === 'loading' && (
          <div className="bg-paper-card border border-line rounded-xl p-6 shadow-card mb-6 text-center">
            <div className="w-14 h-14 rounded-full bg-marigold/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 size={28} className="animate-spin text-marigold-deep" />
            </div>
            <h3 className="text-[15px] font-semibold mb-1">Processing withdrawal...</h3>
            <p className="text-sm text-ink-soft">Please do not close this screen.</p>
          </div>
        )}

        {status !== 'loading' && status !== 'success' && (
          <>
            {/* Amount summary */}
            <div className="bg-gradient-to-br from-ink to-[#2A3660] text-white rounded-2xl p-6 mb-5 text-center">
              <div className="text-[11px] text-indigo-200/80 font-mono mb-1">Withdrawal Amount</div>
              <div className="text-[36px] font-bold font-display mb-1">₹{amount?.toLocaleString('en-IN')}</div>
              <div className="text-[11px] text-indigo-200/60 font-mono">
                To: {account?.label} — {account?.account}
              </div>
            </div>

            {/* Details */}
            <div className="bg-paper-card border border-line rounded-xl p-5 shadow-card mb-6">
              <h3 className="text-sm font-semibold text-ink mb-3">Transaction Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ink-soft">Withdrawal amount</span>
                  <span className="font-semibold">₹{amount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ink-soft">Processing fee (2%)</span>
                  <span className="text-brick font-semibold">-₹{fee.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-px bg-line" />
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-ink">You will receive</span>
                  <span className="font-bold text-[18px] font-mono text-banyan">₹{netAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Account details */}
            <div className="bg-paper-card border border-line rounded-xl p-4 shadow-card mb-6 flex items-center gap-3">
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                account?.type === 'bank' ? 'bg-banyan/10 text-banyan' : 'bg-marigold/10 text-marigold-deep'
              }`}>
                {account?.type === 'bank' ? <Banknote size={20} /> : <Smartphone size={20} />}
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-ink">{account?.label}</div>
                <div className="text-xs text-ink-soft">{account?.account} · {account?.name}</div>
              </div>
            </div>

            {/* Estimated time */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-6">
              <AlertTriangle size={18} className="text-marigold-deep shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-ink mb-0.5">Estimated time</h4>
                <p className="text-xs text-ink-soft">
                  {account?.type === 'upi'
                    ? 'UPI withdrawals are usually processed within 5-10 minutes.'
                    : 'Bank transfers may take 12-24 hours depending on your bank.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full bg-ink text-white py-3.5 rounded-xl font-bold text-[14.5px] shadow-card hover:shadow-lift transition-all active:scale-[.98]"
            >
              Confirm withdrawal of ₹{amount?.toLocaleString('en-IN')}
            </button>
            <button
              onClick={onBack}
              className="w-full mt-3 py-3 rounded-xl border border-line font-semibold text-sm text-ink-soft hover:bg-paper-card transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

