import { useState, useRef } from 'react';
import { ChevronLeft, ImagePlus, Loader2, CheckCircle2, Shield, AlertTriangle, X, CreditCard } from 'lucide-react';
import { ErrorState, LoadingState, SuccessState } from '../../components/ui/PageState';

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600"><AlertTriangle size={14} /> {msg}</div>;
}

export default function PanUpload({ onBack, onNext, initialData }) {
  const [mode, setMode] = useState('upload'); // upload | manual
  const [panNumber, setPanNumber] = useState(initialData?.panNumber || '');
  const [panFile, setPanFile] = useState(null);
  const [fullName, setFullName] = useState(initialData?.fullNameOnPan || '');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef(null);

  const panClean = panNumber.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  const panError = panClean.length > 0 && panClean.length < 10 ? 'Enter a valid 10-character PAN' : '';
  const nameError = fullName.trim() && fullName.trim().length < 3 ? 'Name seems too short' : '';
  const canSubmit = mode === 'upload'
    ? panFile && consent && status !== 'submitting'
    : panClean.length === 10 && fullName.trim().length >= 3 && consent && status !== 'submitting';

  const handleSubmit = () => {
    if (!canSubmit) return;
    setStatus('submitting');
    setErrorMsg('');
    try {
      setStatus('success');
      onNext?.({ panNumber: panClean || 'ABCDE1234F', panFile, fullNameOnPan: fullName.trim() });
    } catch (err) {
      setStatus('error');
      setErrorMsg('Upload failed. Please try again.');
    }
  };

  if (status === 'error') {
    return <ErrorState title="Upload failed" subtitle={errorMsg} onRetry={() => setStatus('idle')} retryLabel="Try again" />;
  }

  if (status === 'success') {
    return <SuccessState title="PAN submitted" subtitle="Your PAN details have been received for verification." onContinue={() => onNext?.({ panNumber: panClean, panFile, fullNameOnPan: fullName.trim() })} />;
  }

  return (
    <div className="pb-6">
      {status === 'submitting' && (
        <div className="p-5 pb-0">
          <LoadingState title="Uploading PAN card..." subtitle="Verifying document." />
        </div>
      )}

      <div className="px-5 pt-5 pb-5 bg-gradient-to-br from-ink to-[#2A3660] text-white">
        <button onClick={onBack} disabled={status === 'submitting'} className="flex items-center gap-1 text-indigo-200/80 text-sm mb-5 disabled:opacity-40">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-marigold/20 text-marigold flex items-center justify-center">
            <CreditCard size={20} />
          </div>
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wide text-indigo-200/70">Step 3 of 5</div>
            <h1 className="font-display text-xl font-bold">PAN Card</h1>
          </div>
        </div>
        <p className="text-indigo-200/70 text-[13px] mt-3 leading-relaxed">
          Upload your PAN card photo. The name on PAN should match your personal details.
        </p>
      </div>

      <div className={`px-5 pt-5 space-y-4 ${status === 'submitting' ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="bg-paper-card border border-line rounded-xl p-1 flex">
          <button onClick={() => setMode('upload')} className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${mode === 'upload' ? 'bg-ink text-white shadow-card' : 'text-ink-soft hover:text-ink'}`}>
            Upload photo
          </button>
          <button onClick={() => setMode('manual')} className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all ${mode === 'manual' ? 'bg-ink text-white shadow-card' : 'text-ink-soft hover:text-ink'}`}>
            Enter manually
          </button>
        </div>

        {mode === 'upload' ? (
          <div>
            <label className="text-xs font-semibold text-ink-soft mb-2 block">PAN card image</label>
            {panFile ? (
              <div className="relative overflow-hidden rounded-xl border border-line bg-white">
                <img src={URL.createObjectURL(panFile)} alt="PAN card" className="w-full h-44 object-cover" />
                <button onClick={() => setPanFile(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink/70 text-white flex items-center justify-center hover:bg-ink" aria-label="Remove">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={status === 'submitting'}
                className="w-full border-2 border-dashed border-line rounded-xl p-8 text-center hover:border-marigold/40 transition-colors disabled:opacity-50"
              >
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setPanFile(e.target.files?.[0] || null)} />
                <ImagePlus size={32} className="mx-auto text-ink-soft mb-2" />
                <div className="text-[13px] font-semibold text-ink">Tap to upload PAN card</div>
                <div className="text-[11px] text-ink-soft mt-1">PNG, JPG — max 5MB</div>
              </button>
            )}
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="pan-number" className="block text-xs font-semibold text-ink-soft mb-1.5">PAN number <span className="text-brick">*</span></label>
              <input
                id="pan-number"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                maxLength={10}
                disabled={status === 'submitting'}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[16px] font-mono font-semibold tracking-wider text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/5 disabled:opacity-60 uppercase"
                aria-invalid={!!panError}
              />
              <FieldError msg={panError} />
            </div>
            <div>
              <label htmlFor="pan-name" className="block text-xs font-semibold text-ink-soft mb-1.5">Name on PAN card <span className="text-brick">*</span></label>
              <input
                id="pan-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="As printed on PAN card"
                disabled={status === 'submitting'}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/5 disabled:opacity-60"
                aria-invalid={!!nameError}
              />
              <FieldError msg={nameError} />
            </div>
          </>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
          <Shield size={16} className="text-marigold-deep mt-0.5 shrink-0" />
          <p className="text-xs text-ink-soft leading-relaxed">
            PAN details are used for tax reporting and identity verification for payments above ₹50,000.
          </p>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} disabled={status === 'submitting'} className="mt-0.5 accent-marigold-deep" />
          <span className="text-xs text-ink-soft leading-relaxed">
            I confirm that the PAN details provided are accurate and belong to me.
          </span>
        </label>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-marigold text-ink font-bold text-[15px] py-4 rounded-2xl shadow-lift flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          {status === 'submitting' ? (
            <><Loader2 size={18} className="animate-spin" /> Uploading...</>
          ) : (
            <><CheckCircle2 size={18} /> Submit PAN</>
          )}
        </button>
      </div>
    </div>
  );
}

