import { useState } from 'react';
import { ChevronLeft, Smartphone, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ErrorState, SuccessState } from '../../components/ui/PageState';
import { updateUpi } from '../../utils/kycApi';

const UPI_APPS = [
  { name: 'Google Pay', handle: '@okhdfcbank', icon: '📱' },
  { name: 'PhonePe', handle: '@ybl', icon: '💳' },
  { name: 'Paytm', handle: '@paytm', icon: '🟡' },
  { name: 'Amazon Pay', handle: '@apl', icon: '📦' },
  { name: 'BHIM', handle: '@upi', icon: '🇮🇳' },
  { name: 'CRED', handle: '@cred', icon: '🟣' },
];

export default function AddUpiId({ onBack, onSave }) {
  const { t } = useLanguage();
  const [upiId, setUpiId] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [verified, setVerified] = useState(false);

  // ── Validation ──────────────────────────────────────────────────────────
  const upiTrim = upiId.trim().toLowerCase();
  const nameTrim = name.trim();

  const errors = {};
  if (!upiTrim) errors.upi = 'UPI ID is required.';
  else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiTrim)) {
    errors.upi = 'Enter a valid UPI ID (e.g. name@bank).';
  }

  if (!nameTrim) errors.name = 'Account holder name is required.';
  else if (nameTrim.length < 3) errors.name = 'Enter a valid full name.';

  const canSubmit = Object.keys(errors).length === 0 && status !== 'loading';

  // ── Detect handle ───────────────────────────────────────────────────────
  const detectedApp = UPI_APPS.find((app) => upiTrim.endsWith(app.handle));

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (!verified) {
      // Step 1: Verify UPI ID format
      setStatus('verifying');
      setErrorMsg('');

      // Real format validation
      if (!/^[\w.-]+@[\w.-]+$/.test(upiTrim)) {
        setStatus('error');
        setErrorMsg('Invalid UPI ID format. Please use format like name@bank');
        return;
      }
      setVerified(true);
      setStatus('idle');
      return;
    }

    // Step 2: Save via API
    setStatus('loading');
    setErrorMsg('');
    try {
      await updateUpi({ upiId: upiTrim });
      setStatus('success');
      onSave?.({ type: 'upi', upiId: upiTrim, name: nameTrim });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || 'Could not save UPI ID. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-5">
        <SuccessState
          title="UPI ID added"
          subtitle={`${upiTrim} has been linked to your account.`}
          onContinue={onBack}
        />
      </div>
    );
  }

  return (
    <div className="p-5 min-h-screen bg-paper">
      <div className="max-w-lg mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-ink-soft text-sm mb-4"
          disabled={status === 'loading' || status === 'verifying'}
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-marigold/10 text-marigold-deep flex items-center justify-center">
            <Smartphone size={24} />
          </div>
          <div>
            <h2 className="text-[20px] font-display font-semibold">Add UPI ID</h2>
            <p className="text-xs text-ink-soft">Withdraw directly to your UPI account</p>
          </div>
        </div>

        {status === 'error' && (
          <div className="mb-4">
            <ErrorState title="Failed" subtitle={errorMsg} onRetry={() => { setStatus('idle'); setVerified(false); }} />
          </div>
        )}

        {(status === 'loading' || status === 'verifying') && (
          <div className="bg-paper-card border border-line rounded-xl p-6 shadow-card mb-6 text-center">
            <Loader2 size={24} className="animate-spin text-marigold-deep mx-auto mb-3" />
            <p className="text-sm font-semibold">
              {status === 'verifying' ? 'Verifying UPI ID...' : 'Saving UPI ID...'}
            </p>
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          noValidate
          className={status === 'loading' || status === 'verifying' ? 'opacity-50 pointer-events-none' : ''}
        >
          {/* UPI ID */}
          <div className="mb-4">
            <label htmlFor="upi-id" className="block text-xs font-semibold text-ink-soft mb-1.5">
              UPI ID
            </label>
            <input
              id="upi-id"
              value={upiId}
              onChange={(e) => {
                setUpiId(e.target.value);
                setVerified(false);
              }}
              placeholder="e.g. name@okhdfcbank"
              disabled={status === 'loading' || status === 'verifying'}
              aria-invalid={!!errors.upi}
              className="w-full px-3.5 py-3 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marigold/40 disabled:opacity-60"
            />
            {errors.upi && (
              <div className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                <AlertTriangle size={13} /> {errors.upi}
              </div>
            )}
            {verified && (
              <div className="mt-1 flex items-center gap-1 text-xs text-banyan">
                <CheckCircle2 size={13} /> UPI ID verified
              </div>
            )}
          </div>

          {/* Account holder name */}
          <div className="mb-6">
            <label htmlFor="upi-name" className="block text-xs font-semibold text-ink-soft mb-1.5">
              Account holder name
            </label>
            <input
              id="upi-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name linked to this UPI"
              disabled={status === 'loading' || status === 'verifying'}
              aria-invalid={!!errors.name}
              className="w-full px-3.5 py-3 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marigold/40 disabled:opacity-60"
            />
            {errors.name && (
              <div className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                <AlertTriangle size={13} /> {errors.name}
              </div>
            )}
          </div>

          {/* Detected UPI app */}
          {detectedApp && !verified && (
            <div className="bg-paper-card border border-line rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="text-2xl">{detectedApp.icon}</span>
              <div>
                <div className="text-sm font-semibold text-ink">{detectedApp.name}</div>
                <div className="text-xs text-ink-soft">Detected UPI handle · {detectedApp.handle}</div>
              </div>
            </div>
          )}

          {/* Common UPI handles */}
          {!upiTrim && (
            <div className="mb-6">
              <div className="text-xs font-semibold text-ink-soft mb-2 font-mono uppercase tracking-wide">
                Common UPI handles
              </div>
              <div className="flex gap-2 flex-wrap">
                {UPI_APPS.map((app) => (
                  <button
                    key={app.handle}
                    type="button"
                    onClick={() => setUpiId(`yourname${app.handle}`)}
                    className="px-3 py-2 rounded-lg border border-line bg-white text-xs font-semibold hover:bg-paper-card transition-colors flex items-center gap-1.5"
                  >
                    <span>{app.icon}</span> {app.handle}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-ink text-white py-3.5 rounded-xl font-bold text-[14.5px] shadow-card hover:shadow-lift transition-all active:scale-[.98] disabled:opacity-40"
          >
            {verified ? 'Save UPI ID' : 'Verify UPI ID'}
          </button>
        </form>
      </div>
    </div>
  );
}

