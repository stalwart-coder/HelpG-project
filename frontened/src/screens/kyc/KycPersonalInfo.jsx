import { useState } from 'react';
import { ChevronLeft, User, Phone, Mail, MapPin, Calendar, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ErrorState, LoadingState, SuccessState } from '../../components/ui/PageState';

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
      <AlertTriangle size={14} /> {msg}
    </div>
  );
}

function formatPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)} ${d.slice(5)}`;
}

export default function KycPersonalInfo({ onBack, onNext, initialData }) {
  const [form, setForm] = useState({
    fullName: initialData?.fullName || '',
    dob: initialData?.dob || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    pincode: initialData?.pincode || '',
    gender: initialData?.gender || '',
  });
  const [status, setStatus] = useState('idle'); // idle | submitting | error | success
  const [errorMsg, setErrorMsg] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const errors = {
    fullName: !form.fullName.trim() ? 'Full name is required' : form.fullName.trim().length < 3 ? 'Name must be at least 3 characters' : '',
    dob: !form.dob.trim() ? 'Date of birth is required' : '',
    phone: !form.phone.trim() ? 'Phone number is required' : form.phone.replace(/\D/g, '').length < 10 ? 'Enter a valid 10-digit phone number' : '',
    email: form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? 'Enter a valid email address' : '',
    address: !form.address.trim() ? 'Address is required' : form.address.trim().length < 5 ? 'Address must be at least 5 characters' : '',
    city: !form.city.trim() ? 'City is required' : '',
    pincode: form.pincode.trim() && !/^\d{6}$/.test(form.pincode.trim()) ? 'Enter a valid 6-digit pincode' : '',
  };

  const hasErrors = Object.values(errors).some(Boolean);
  const canSubmit = !hasErrors && status !== 'submitting';

  const handleSubmit = () => {
    if (!canSubmit) return;
    setStatus('submitting');
    setErrorMsg('');
    try {
      setStatus('success');
      onNext?.(form);
    } catch (err) {
      setStatus('error');
      setErrorMsg('Unable to proceed. Please check your details.');
    }
  };

  if (status === 'error') {
    return <ErrorState title="Save failed" subtitle={errorMsg} onRetry={() => setStatus('idle')} retryLabel="Try again" />;
  }

  if (status === 'success') {
    return <SuccessState title="Personal info saved" subtitle="Your details have been recorded." onContinue={() => onNext?.(form)} />;
  }

  const inputCls = 'w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/5 disabled:opacity-60';

  return (
    <div className="pb-6">
      {status === 'submitting' && (
        <div className="p-5 pb-0">
          <LoadingState title="Saving your details..." subtitle="Please wait." />
        </div>
      )}

      <div className="px-5 pt-5 pb-5 bg-gradient-to-br from-ink to-[#2A3660] text-white">
        <button onClick={onBack} disabled={status === 'submitting'} className="flex items-center gap-1 text-indigo-200/80 text-sm mb-5 disabled:opacity-40">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-marigold/20 text-marigold flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wide text-indigo-200/70">Step 1 of 5</div>
            <h1 className="font-display text-xl font-bold">Personal Information</h1>
          </div>
        </div>
        <p className="text-indigo-200/70 text-[13px] mt-3 leading-relaxed">
          This information will be used for verification and must match your government ID documents.
        </p>
      </div>

      <div className={`px-5 pt-5 space-y-4 ${status === 'submitting' ? 'opacity-40 pointer-events-none' : ''}`}>
        <div>
          <label htmlFor="kyc-name" className="block text-xs font-semibold text-ink-soft mb-1.5">
            Full name <span className="text-brick">*</span>
          </label>
          <input id="kyc-name" value={form.fullName} onChange={set('fullName')} placeholder="As per Aadhaar / PAN" className={inputCls} disabled={status === 'submitting'} aria-invalid={!!errors.fullName} />
          <FieldError msg={errors.fullName} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="kyc-dob" className="block text-xs font-semibold text-ink-soft mb-1.5">
              Date of birth <span className="text-brick">*</span>
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input id="kyc-dob" value={form.dob} onChange={set('dob')} placeholder="DD/MM/YYYY" className={`${inputCls} pl-10`} disabled={status === 'submitting'} aria-invalid={!!errors.dob} />
            </div>
            <FieldError msg={errors.dob} />
          </div>

          <div>
            <label htmlFor="kyc-gender" className="block text-xs font-semibold text-ink-soft mb-1.5">Gender</label>
            <select id="kyc-gender" value={form.gender} onChange={set('gender')} className={inputCls} disabled={status === 'submitting'}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="kyc-phone" className="block text-xs font-semibold text-ink-soft mb-1.5">
              Phone number <span className="text-brick">*</span>
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input id="kyc-phone" value={formatPhone(form.phone)} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="98290 41763" className={`${inputCls} pl-10`} disabled={status === 'submitting'} aria-invalid={!!errors.phone} />
            </div>
            <FieldError msg={errors.phone} />
          </div>

          <div>
            <label htmlFor="kyc-email" className="block text-xs font-semibold text-ink-soft mb-1.5">Email <span className="font-normal text-ink-soft/70">(optional)</span></label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input id="kyc-email" value={form.email} onChange={set('email')} placeholder="ramesh@email.com" className={`${inputCls} pl-10`} disabled={status === 'submitting'} aria-invalid={!!errors.email} />
            </div>
            <FieldError msg={errors.email} />
          </div>
        </div>

        <div>
          <label htmlFor="kyc-address" className="block text-xs font-semibold text-ink-soft mb-1.5">
            Address <span className="text-brick">*</span>
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-4 text-ink-soft" />
            <textarea id="kyc-address" value={form.address} onChange={set('address')} placeholder="Street, building, landmark" className={`${inputCls} pl-10 min-h-[80px] resize-none`} disabled={status === 'submitting'} aria-invalid={!!errors.address} />
          </div>
          <FieldError msg={errors.address} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="kyc-city" className="block text-xs font-semibold text-ink-soft mb-1.5">City <span className="text-brick">*</span></label>
            <input id="kyc-city" value={form.city} onChange={set('city')} placeholder="e.g. Jaipur" className={inputCls} disabled={status === 'submitting'} aria-invalid={!!errors.city} />
            <FieldError msg={errors.city} />
          </div>
          <div>
            <label htmlFor="kyc-pincode" className="block text-xs font-semibold text-ink-soft mb-1.5">Pincode <span className="font-normal text-ink-soft/70">(optional)</span></label>
            <input id="kyc-pincode" value={form.pincode} onChange={set('pincode')} placeholder="302017" maxLength={6} className={inputCls} disabled={status === 'submitting'} aria-invalid={!!errors.pincode} />
            <FieldError msg={errors.pincode} />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-marigold text-ink font-bold text-[15px] py-4 rounded-2xl shadow-lift flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform mt-2"
        >
          {status === 'submitting' ? (
            <><Loader2 size={18} className="animate-spin" /> Saving...</>
          ) : (
            <><CheckCircle2 size={18} /> Save & Continue</>
          )}
        </button>

        <p className="text-center text-[11px] text-ink-soft">
          Your data is encrypted and only used for verification purposes.
        </p>
      </div>
    </div>
  );
}

