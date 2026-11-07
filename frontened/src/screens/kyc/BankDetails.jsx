import { useState } from 'react';
import { ChevronLeft, Building2, Smartphone, Wallet, Loader2, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
import { ErrorState, LoadingState, SuccessState } from '../../components/ui/PageState';

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600"><AlertTriangle size={14} /> {msg}</div>;
}

export default function BankDetails({ onBack, onNext, initialData }) {
  const [mode, setMode] = useState('upi'); // upi | bank
  const [upiId, setUpiId] = useState(initialData?.upiId || '');
  const [accountName, setAccountName] = useState(initialData?.accountName || '');
  const [accountNumber, setAccountNumber] = useState(initialData?.accountNumber || '');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(initialData?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(initialData?.ifscCode || '');
  const [bankName, setBankName] = useState(initialData?.bankName || '');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [ifscLookup, setIfscLookup] = useState('idle'); // idle | looking | found

  const formatAcct = (v) => v.replace(/\D/g, '').slice(0, 18);
  const formatIfsc = (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);

  const errors = mode === 'upi' ? {
    upiId: upiId.trim() && !/^[\w.\-_]+@[\w.\-_]+$/.test(upiId.trim()) ? 'Enter a valid UPI ID (e.g. name@upi)' : '',
  } : {
    accountName: !accountName.trim() ? 'Account holder name is required' : accountName.trim().length < 3 ? 'Name seems too short' : '',
    accountNumber: !accountNumber.trim() ? 'Account number is required' : accountNumber.replace(/\D/g, '').length < 9 ? 'Account number must be at least 9 digits' : '',
    confirmAccountNumber: confirmAccountNumber !== accountNumber ? 'Account numbers do not match' : '',
    ifscCode: !ifscCode.trim() ? 'IFSC code is required' : !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formatIfsc(ifscCode)) ? 'Enter a valid IFSC code (e.g. HDFC0001234)' : '',
  };

  const hasErrors = Object.values(errors).some(Boolean);
  const isComplete = mode === 'upi'
    ? /^[\w.\-_]+@[\w.\-_]+$/.test(upiId.trim()) && consent
    : accountName.trim().length >= 3 && accountNumber.replace(/\D/g, '').length >= 9 && accountNumber === confirmAccountNumber && /^[A-Z]{4}0[A-Z0-9]{6}$/.test(formatIfsc(ifscCode)) && consent;

  const canSubmit = isComplete && status !== 'submitting';

  const handleIfscLookup = () => {
    const ifsc = formatIfsc(ifscCode);
    if (ifsc.length !== 11) return;
    setIfscLookup('looking');
    setTimeout(() => {
      // Mock lookup
      setBankName('HDFC Bank');
      setIfscLookup('found');
    }, 600);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    setStatus('submitting');
    setErrorMsg('');
    try {
      setStatus('success');
      onNext?.({ mode, upiId: upiId.trim(), accountName: accountName.trim(), accountNumber: accountNumber.replace(/\D/g, ''), ifscCode: formatIfsc(ifscCode), bankName });
    } catch (err) {
      setStatus('error');
      setErrorMsg('Unable to save bank details. Please try again.');
    }
  };

  if (status === 'error') {
    return <ErrorState title="Save failed" subtitle={errorMsg} onRetry={() => setStatus('idle')} retryLabel="Try again" />;
  }

  if (status === 'success') {
    return <SuccessState title="Bank details saved!" subtitle="Your payout information has been recorded and will be verified." onContinue={() => onNext?.({ mode, upiId: upiId.trim(), accountName: accountName.trim(), accountNumber: accountNumber.replace(/\D/g, ''), ifscCode: formatIfsc(ifscCode), bankName })} />;
  }

  return (
    <div className="pb-6">
      {status === 'submitting' && (
        <div className="p-5 pb-0">
          <LoadingState title="Saving payout details..." subtitle="Encrypting your banking information." />
        </div>
      )}

      <div className="px-5 pt-5 pb-5 bg-gradient-to-br from-ink to-[#2A3660] text-white">
        <button onClick={onBack} disabled={status === 'submitting'} className="flex items-center gap-1 text-indigo-200/80 text-sm mb-5 disabled:opacity-40">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-marigold/20 text-marigold flex items-center justify-center">
            <Wallet size={20} />
          </div>
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wide text-indigo-200/70">Step 5 of 5</div>
            <h1 className="font-display text-xl font-bold">Payout Details</h1>
          </div>
        </div>
        <p className="text-indigo-200/70 text-[13px] mt-3 leading-relaxed">
          Add your payout method to receive payments for completed tasks. You can change this later.
        </p>
      </div>

      <div className={`px-5 pt-5 space-y-4 ${status === 'submitting' ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="bg-paper-card border border-line rounded-xl p-1 flex">
          <button onClick={() => setMode('upi')} className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all flex items-center justify-center gap-2 ${mode === 'upi' ? 'bg-ink text-white shadow-card' : 'text-ink-soft hover:text-ink'}`}>
            <Smartphone size={16} /> UPI
          </button>
          <button onClick={() => setMode('bank')} className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all flex items-center justify-center gap-2 ${mode === 'bank' ? 'bg-ink text-white shadow-card' : 'text-ink-soft hover:text-ink'}`}>
            <Building2 size={16} /> Bank Account
          </button>
        </div>

        {mode === 'upi' ? (
          <div>
            <label htmlFor="upi-id" className="block text-xs font-semibold text-ink-soft mb-1.5">
              UPI ID <span className="text-brick">*</span>
            </label>
            <div className="relative">
              <Smartphone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                id="upi-id"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                placeholder="ramesh@okaxis"
                disabled={status === 'submitting'}
                className="w-full rounded-xl border border-line bg-white pl-10 pr-4 py-3 text-[14px] text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/5 disabled:opacity-60"
                aria-invalid={!!errors.upiId}
              />
            </div>
            <FieldError msg={errors.upiId} />
            <p className="text-[11px] text-ink-soft mt-1">Supported: Google Pay, PhonePe, Paytm, BHIM, and all UPI apps</p>
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="bank-name" className="block text-xs font-semibold text-ink-soft mb-1.5">Account holder name <span className="text-brick">*</span></label>
              <input id="bank-name" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="As per bank records" disabled={status === 'submitting'} className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/5 disabled:opacity-60" aria-invalid={!!errors.accountName} />
              <FieldError msg={errors.accountName} />
            </div>

            <div>
              <label htmlFor="account-number" className="block text-xs font-semibold text-ink-soft mb-1.5">Account number <span className="text-brick">*</span></label>
              <input id="account-number" value={accountNumber} onChange={(e) => setAccountNumber(formatAcct(e.target.value))} placeholder="Enter account number" disabled={status === 'submitting'} className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] font-mono tracking-wider text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/5 disabled:opacity-60" aria-invalid={!!errors.accountNumber} />
              <FieldError msg={errors.accountNumber} />
            </div>

            <div>
              <label htmlFor="confirm-account" className="block text-xs font-semibold text-ink-soft mb-1.5">Confirm account number <span className="text-brick">*</span></label>
              <input id="confirm-account" value={confirmAccountNumber} onChange={(e) => setConfirmAccountNumber(formatAcct(e.target.value))} placeholder="Re-enter account number" disabled={status === 'submitting'} className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] font-mono tracking-wider text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/5 disabled:opacity-60" aria-invalid={!!errors.confirmAccountNumber} />
              <FieldError msg={errors.confirmAccountNumber} />
            </div>

            <div>
              <label htmlFor="ifsc-code" className="block text-xs font-semibold text-ink-soft mb-1.5">IFSC code <span className="text-brick">*</span></label>
              <div className="flex gap-2">
                <input
                  id="ifsc-code"
                  value={ifscCode}
                  onChange={(e) => { setIfscCode(e.target.value.toUpperCase()); setBankName(''); setIfscLookup('idle'); }}
                  onBlur={handleIfscLookup}
                  placeholder="HDFC0001234"
                  maxLength={11}
                  disabled={status === 'submitting'}
                  className="flex-1 rounded-xl border border-line bg-white px-4 py-3 text-[14px] font-mono tracking-wider text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/5 disabled:opacity-60 uppercase"
                  aria-invalid={!!errors.ifscCode}
                />
              </div>
              <FieldError msg={errors.ifscCode} />
              {ifscLookup === 'looking' && <div className="mt-1.5 text-xs text-marigold-deep font-medium">Looking up IFSC...</div>}
              {ifscLookup === 'found' && bankName && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-banyan font-medium">
                  <CheckCircle2 size={14} /> {bankName}
                </div>
              )}
            </div>
          </>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
          <Shield size={16} className="text-marigold-deep mt-0.5 shrink-0" />
          <p className="text-xs text-ink-soft leading-relaxed">
            Your banking details are encrypted and used only for payouts. We are PCI-compliant and never share your data.
          </p>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} disabled={status === 'submitting'} className="mt-0.5 accent-marigold-deep" />
          <span className="text-xs text-ink-soft leading-relaxed">
            I confirm the details above are accurate and authorize HelpJi to deposit earnings to this account/UPI.
          </span>
        </label>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-marigold text-ink font-bold text-[15px] py-4 rounded-2xl shadow-lift flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          {status === 'submitting' ? (
            <><Loader2 size={18} className="animate-spin" /> Saving...</>
          ) : (
            <><Wallet size={18} /> Save Payout Details</>
          )}
        </button>

        {mode === 'bank' && (
          <p className="text-center text-[11px] text-ink-soft">
            Bank verification via micro-deposit typically takes 1-2 business days.
          </p>
        )}
      </div>
    </div>
  );
}

