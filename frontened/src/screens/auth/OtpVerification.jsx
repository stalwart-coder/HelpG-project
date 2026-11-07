import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertTriangle, ChevronLeft, CheckCircle2 } from 'lucide-react';

export default function OtpVerification({ flow, onNavigate }) {
  const { t } = useLanguage();
  const { verifyOtp, authLoading, authError, clearError } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [step, setStep] = useState('verify'); // verify | success
  const inputRefs = useRef([]);

  // Timer for resend
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const otpString = otp.join('');
  const isComplete = otpString.length === 6;

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    if (authError) clearError();
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((digit, i) => { next[i] = digit; });
    setOtp(next);
    if (pasted.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (!isComplete || authLoading) return;
    clearError();
    const result = await verifyOtp(otpString);
    if (result) {
      if (result.isNew) {
        // New user — go to signup
        setStep('success');
        setTimeout(() => onNavigate?.('signup'), 1200);
      } else {
        // Existing user — go to app
        setStep('success');
        setTimeout(() => onNavigate?.('app'), 1200);
      }
    }
  };

  const handleResend = async () => {
    if (!canResend || authLoading) return;
    setTimer(30);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    // Resend OTP would call sendOtp again
  };

  // TODO: Replace with actual phone number from auth flow
  const phoneDisplay = '9876543210';

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[440px] text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-banyan flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={36} />
          </div>
          <h1 className="font-display text-[26px] font-bold text-ink mb-2">Verified!</h1>
          <p className="text-ink-soft text-[14px]">Redirecting you…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-[440px]">
        <button
          type="button"
          onClick={() => onNavigate?.(flow === 'signup' ? 'signup' : 'login')}
          className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors mb-8"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="mb-8">
          <div className="w-12 h-12 rounded-2xl bg-marigold/10 text-marigold-deep flex items-center justify-center mb-4">
            <span className="text-2xl">📱</span>
          </div>
          <h1 className="font-display text-[26px] font-bold text-ink leading-tight mb-1">
            Enter verification code
          </h1>
          <p className="text-ink-soft text-[14px]">
            We&apos;ve sent a 6-digit code to{' '}
            <span className="font-semibold text-ink">+91 {phoneDisplay}</span>
          </p>
        </div>

        {/* OTP inputs */}
        <div className="flex justify-center gap-2.5 mb-6" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
              aria-label={`Digit ${i + 1} of OTP`}
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-[22px] font-bold font-mono
                         border border-line rounded-xl bg-white text-ink outline-none
                         transition-all duration-200
                         focus:border-ink focus:ring-4 focus:ring-ink/5
                         disabled:opacity-50"
              disabled={authLoading}
            />
          ))}
        </div>

        {/* Error */}
        {authError && (
          <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mb-5 animate-fade-in">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isComplete || authLoading}
          className="w-full bg-ink text-white font-bold text-[15px] py-4 rounded-xl
                     shadow-lift hover:bg-ink/90 active:scale-[0.98] transition-all duration-200
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {authLoading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" /> Verifying…
            </span>
          ) : (
            'Verify & continue'
          )}
        </button>

        {/* Resend */}
        <div className="text-center mt-6">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={authLoading}
              className="text-[13px] font-semibold text-marigold-deep hover:text-marigold transition-colors"
            >
              Resend code
            </button>
          ) : (
            <p className="text-[13px] text-ink-soft">
              Resend code in <span className="font-semibold text-ink">{timer}s</span>
            </p>
          )}
        </div>

        {/* Edit number */}
        <p className="text-center text-[12.5px] text-ink-soft mt-4">
          Wrong number?{' '}
          <button
            type="button"
            onClick={() => onNavigate?.(flow === 'signup' ? 'signup' : 'login')}
            className="font-semibold text-ink underline underline-offset-2"
            disabled={authLoading}
          >
            Edit phone number
          </button>
        </p>
      </div>
    </div>
  );
}

