import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertTriangle, ChevronLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 animate-fade-in"><AlertTriangle size={13} /> {msg}</div>;
}

export default function ForgotPassword({ onNavigate }) {
  const { t } = useLanguage();
  const { forgotPassword, sendOtp, resetPassword, authLoading, authError, clearError } = useAuth();

  const [step, setStep] = useState('phone'); // phone | otp | password | success
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [touched, setTouched] = useState({});
  const inputRefs = useRef([]);

  // Timer
  useEffect(() => {
    if (step !== 'otp') return;
    if (timer <= 0) { setCanResend(true); return; }
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer, step]);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setTouched((p) => ({ ...p, phone: true }));
    if (!phone.trim() || phone.trim().length < 10) return;
    clearError();
    const ok = await forgotPassword(`+91${phone.trim()}`);
    if (ok) {
      sessionStorage.setItem('helpji_reset_phone', `+91${phone.trim()}`);
      setStep('otp');
      setTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    }
  };

  // ── Step 2: Verify OTP → show password reset ──────────────────────────
  const otpString = otp.join('');
  const isOtpComplete = otpString.length === 6;

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    if (authError) clearError();
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    if (!isOtpComplete || authLoading) return;
    setStep('password');
    clearError();
  };

  // ── Step 3: Reset password ────────────────────────────────────────────
  const pwErrors = {};
  if (!newPassword.trim()) pwErrors.password = 'New password is required.';
  else if (newPassword.trim().length < 4) pwErrors.password = 'Password must be at least 4 characters.';

  const handleReset = async (e) => {
    e.preventDefault();
    setTouched((p) => ({ ...p, password: true }));
    if (Object.keys(pwErrors).length || authLoading) return;
    clearError();
    const storedPhone = sessionStorage.getItem('helpji_reset_phone') || `+91${phone.trim()}`;
    const ok = await resetPassword({ phone: storedPhone, otp: otpString, newPassword: newPassword.trim() });
    if (ok) setStep('success');
  };

  // ── Resend ─────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend || authLoading) return;
    setTimer(30);
    setCanResend(false);
    clearError();
    const storedPhone = sessionStorage.getItem('helpji_reset_phone') || `+91${phone.trim()}`;
    await forgotPassword(storedPhone);
  };

  // ── Success screen ────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[440px] text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-banyan flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={36} />
          </div>
          <h1 className="font-display text-[26px] font-bold text-ink mb-2">Password reset!</h1>
          <p className="text-ink-soft text-[14px] mb-6">Your password has been updated successfully.</p>
          <button
            type="button"
            onClick={() => onNavigate?.('login')}
            className="bg-ink text-white font-bold text-[15px] px-8 py-4 rounded-xl shadow-lift hover:bg-ink/90 transition-all"
          >
            Sign in with new password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-[440px]">
        <button
          type="button"
          onClick={() => {
            if (step === 'phone') onNavigate?.('login');
            else if (step === 'otp') setStep('phone');
            else if (step === 'password') { setStep('otp'); clearError(); }
          }}
          className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors mb-8"
        >
          <ChevronLeft size={16} />
          {step === 'phone' ? 'Back to sign in' : 'Back'}
        </button>

        <div className="mb-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-marigold-deep flex items-center justify-center mb-4">
            <span className="text-2xl">🔑</span>
          </div>
          <h1 className="font-display text-[26px] font-bold text-ink leading-tight mb-1">
            {step === 'phone' && 'Reset your password'}
            {step === 'otp' && 'Enter verification code'}
            {step === 'password' && 'Set new password'}
          </h1>
          <p className="text-ink-soft text-[14px]">
            {step === 'phone' && "Enter your phone number and we'll send you a reset code."}
            {step === 'otp' && `Enter the 6-digit code sent to +91 ${phone}.`}
            {step === 'password' && 'Choose a new password for your account.'}
          </p>
        </div>

        {/* ── Step 1: Phone ───────────────────────────────────────────── */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} noValidate>
            <div className="mb-6">
              <label htmlFor="forgot-phone" className="block text-xs font-semibold text-ink-soft mb-1.5">Phone number</label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-3.5 py-3.5 border border-line rounded-xl bg-paper-card text-sm font-semibold text-ink shrink-0">
                  <span>🇮🇳</span> +91
                </div>
                <input
                  id="forgot-phone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); if (authError) clearError(); }}
                  placeholder="9876543210"
                  className="flex-1 px-4 py-3.5 border border-line rounded-xl text-sm bg-white text-ink placeholder:text-ink-soft/50 outline-none transition-all duration-200 focus:border-ink focus:ring-4 focus:ring-ink/5 disabled:opacity-50"
                  disabled={authLoading}
                />
              </div>
              {touched.phone && phone.trim().length < 10 && <FieldError msg="Enter a valid 10-digit phone number." />}
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mb-5 animate-fade-in">
                <AlertTriangle size={16} className="shrink-0" /> <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={phone.trim().length < 10 || authLoading}
              className="w-full bg-ink text-white font-bold text-[15px] py-4 rounded-xl shadow-lift hover:bg-ink/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {authLoading ? (
                <span className="inline-flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin" /> Sending code…</span>
              ) : (
                'Send reset code'
              )}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP ─────────────────────────────────────────────── */}
        {step === 'otp' && (
          <div>
            <div className="flex justify-center gap-2.5 mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onFocus={(e) => e.target.select()}
                  aria-label={`Digit ${i + 1}`}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-[22px] font-bold font-mono border border-line rounded-xl bg-white text-ink outline-none transition-all duration-200 focus:border-ink focus:ring-4 focus:ring-ink/5 disabled:opacity-50"
                  disabled={authLoading}
                />
              ))}
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mb-5 animate-fade-in">
                <AlertTriangle size={16} className="shrink-0" /> <span>{authError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={!isOtpComplete || authLoading}
              className="w-full bg-ink text-white font-bold text-[15px] py-4 rounded-xl shadow-lift hover:bg-ink/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {authLoading ? (
                <span className="inline-flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin" /> Verifying…</span>
              ) : (
                'Verify code'
              )}
            </button>

            <div className="text-center mt-6">
              {canResend ? (
                <button type="button" onClick={handleResend} disabled={authLoading} className="text-[13px] font-semibold text-marigold-deep hover:text-marigold transition-colors">Resend code</button>
              ) : (
                <p className="text-[13px] text-ink-soft">Resend in <span className="font-semibold text-ink">{timer}s</span></p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: New password ────────────────────────────────────── */}
        {step === 'password' && (
          <form onSubmit={handleReset} noValidate>
            <div className="mb-6">
              <label htmlFor="new-password" className="block text-xs font-semibold text-ink-soft mb-1.5">New password</label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); if (authError) clearError(); }}
                  onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                  placeholder="At least 4 characters"
                  className="w-full px-4 py-3.5 pr-12 border border-line rounded-xl text-sm bg-white text-ink placeholder:text-ink-soft/50 outline-none transition-all duration-200 focus:border-ink focus:ring-4 focus:ring-ink/5 disabled:opacity-50"
                  disabled={authLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {touched.password && <FieldError msg={pwErrors.password} />}
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mb-5 animate-fade-in">
                <AlertTriangle size={16} className="shrink-0" /> <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!!pwErrors.password || authLoading}
              className="w-full bg-ink text-white font-bold text-[15px] py-4 rounded-xl shadow-lift hover:bg-ink/90 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {authLoading ? (
                <span className="inline-flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin" /> Resetting…</span>
              ) : (
                'Reset password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

