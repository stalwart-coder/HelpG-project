import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2, AlertTriangle, ChevronLeft, ArrowRight } from 'lucide-react';

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div
      className="mt-1.5 flex items-center gap-1.5 text-xs font-medium animate-fade-in"
      style={{ color: '#EF4444' }}
    >
      <AlertTriangle size={12} /> {msg}
    </div>
  );
}

export default function Login({ onNavigate }) {
  const { t } = useLanguage();
  const { login, loginWithGoogle, authLoading, authError, clearError } = useAuth();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched]           = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const errors = {};
  const eop = emailOrPhone.trim();
  if (!eop) errors.emailOrPhone = 'Email or phone is required.';
  else if (eop.length < 3) errors.emailOrPhone = 'Enter a valid email or phone number.';
  if (!password.trim()) errors.password = 'Password is required.';
  else if (password.trim().length < 4) errors.password = 'Password must be at least 4 characters.';

  const canSubmit = Object.keys(errors).length === 0 && !authLoading && !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || authLoading) return;
    setTouched({ emailOrPhone: true, password: true });
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    clearError();
    try {
      const ok = await login({ emailOrPhone: eop, password: password.trim() });
      if (ok) onNavigate?.('app');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isSubmitting || authLoading) return;
    setIsSubmitting(true);
    clearError();
    try {
      const res = await loginWithGoogle('customer');
      if (res?.success) {
        onNavigate?.('app');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role) => {
    if (isSubmitting || authLoading) return;
    setIsSubmitting(true);
    clearError();
    try {
      const creds = role === 'helper'
        ? { emailOrPhone: 'helper@helpji.com', password: 'Password@123' }
        : { emailOrPhone: 'customer@helpji.com', password: 'Password@123' };
      setEmailOrPhone(creds.emailOrPhone);
      setPassword(creds.password);
      const ok = await login(creds);
      if (ok) onNavigate?.('app');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-10"
      style={{ background: 'var(--hj-paper)' }}
    >
      <div className="w-full max-w-[420px]">
        {/* Back */}
        <button
          type="button"
          onClick={() => onNavigate?.('landing')}
          className="flex items-center gap-1.5 text-sm font-medium mb-8
                     transition-colors focus:outline-none"
          style={{ color: 'var(--hj-ink-muted)', fontFamily: 'DM Sans, sans-serif' }}
        >
          <ChevronLeft size={16} /> {t('backToHome')}
        </button>

        {/* Brand mark */}
        <div className="flex items-center gap-2.5 mb-6">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center font-extrabold text-lg text-white"
            style={{ background: 'var(--hj-ink)', fontFamily: 'Sora, sans-serif' }}
          >
            H
          </div>
          <span
            className="font-extrabold text-xl"
            style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)', letterSpacing: '-0.03em' }}
          >
            {t('brandName')}
          </span>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <h1
            className="font-extrabold tracking-tight mb-1.5"
            style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: '1.875rem',
              color: 'var(--hj-ink)',
              letterSpacing: '-0.03em',
            }}
          >
            {t('loginHeading')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--hj-ink-soft)', fontFamily: 'DM Sans, sans-serif' }}>
            {t('loginSubtext')}
          </p>
        </div>

        {/* ⚡ Quick Demo Logins */}
        <div
          className="mb-6 p-3.5 rounded-2xl"
          style={{
            background: 'rgba(244,131,31,0.06)',
            border: '1px solid rgba(244,131,31,0.20)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[11px] font-bold tracking-wider uppercase"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#E06A08' }}
            >
              {t('quickDemoLabel')}
            </span>
            <span
              className="text-[10px]"
              style={{ color: '#E06A08', fontFamily: 'DM Sans, sans-serif' }}
            >
              {t('quickDemoSub')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { role: 'customer', emoji: '🙋', label: 'Demo Customer', email: 'customer@helpji.com' },
              { role: 'helper',   emoji: '🛠️', label: 'Demo Helper',   email: 'helper@helpji.com'   },
            ].map((d) => (
              <button
                key={d.role}
                type="button"
                onClick={() => handleQuickLogin(d.role)}
                disabled={authLoading}
                className="px-3 py-2 rounded-xl text-left flex flex-col
                           active:scale-[0.97] transition-all disabled:opacity-50"
                style={{
                  background: 'var(--hj-paper-card)',
                  border: '1px solid rgba(244,131,31,0.20)',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                <span className="text-xs font-semibold" style={{ color: 'var(--hj-ink)' }}>
                  {d.emoji} {d.label}
                </span>
                <span className="text-[10px] mt-0.5" style={{ color: 'var(--hj-ink-muted)' }}>
                  {d.email}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email / Phone */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold mb-1.5"
              style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink-soft)' }}
            >
              {t('emailOrPhoneLabel')}
            </label>
            <input
              id="login-email"
              type="text"
              inputMode="email"
              autoComplete="email"
              value={emailOrPhone}
              onChange={(e) => { setEmailOrPhone(e.target.value); if (authError) clearError(); }}
              onBlur={() => setTouched((p) => ({ ...p, emailOrPhone: true }))}
              placeholder={t('emailOrPhonePlaceholder')}
              aria-invalid={!!(touched.emailOrPhone && errors.emailOrPhone)}
              className="hj-input"
              disabled={authLoading}
            />
            {touched.emailOrPhone && <FieldError msg={errors.emailOrPhone} />}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold mb-1.5"
              style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink-soft)' }}
            >
              {t('passwordLabel')}
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (authError) clearError(); }}
                onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                placeholder={t('passwordPlaceholder')}
                aria-invalid={!!(touched.password && errors.password)}
                className="hj-input pr-12"
                disabled={authLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--hj-ink-muted)' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {touched.password && <FieldError msg={errors.password} />}
          </div>

          {/* Forgot */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => onNavigate?.('forgot-password')}
              className="text-[13px] font-semibold transition-colors focus:outline-none"
              style={{ color: '#F4831F', fontFamily: 'DM Sans, sans-serif' }}
              disabled={authLoading}
            >
              {t('forgotPasswordLink')}
            </button>
          </div>

          {/* Auth error */}
          {authError && (
            <div
              className="flex items-center gap-2 text-sm rounded-xl px-4 py-3 animate-fade-in"
              style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#EF4444',
              }}
            >
              <AlertTriangle size={15} className="shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full font-bold text-[15px] py-4 rounded-xl text-white
                       flex items-center justify-center gap-2
                       active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              fontFamily: 'Sora, sans-serif',
              background: 'var(--hj-ink)',
              boxShadow: canSubmit ? '0 4px 16px rgba(26,26,46,0.15)' : 'none',
            }}
          >
            {authLoading
              ? <><Loader2 size={18} className="animate-spin" /> {t('signingInState')}</>
              : <>{t('signInSubmit')} <ArrowRight size={16} /></>
            }
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: 'var(--hj-line)' }} />
          <span className="text-[12px] font-medium" style={{ color: 'var(--hj-ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>
            {t('orContinueWith')}
          </span>
          <div className="flex-1 h-px" style={{ background: 'var(--hj-line)' }} />
        </div>

        {/* Alt auth */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onNavigate?.('otp', 'login')}
            disabled={authLoading}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl
                       text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              background: 'var(--hj-paper-card)',
              border: '1.5px solid var(--hj-line)',
              color: 'var(--hj-ink)',
            }}
          >
            <span className="text-lg">📱</span> {t('phoneOtpAuth')}
          </button>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={authLoading || isSubmitting}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl
                       text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer hover:opacity-90"
            style={{
              fontFamily: 'DM Sans, sans-serif',
              background: 'var(--hj-paper-card)',
              border: '1.5px solid var(--hj-line)',
              color: 'var(--hj-ink)',
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('googleAuth')}
          </button>
        </div>

        <p className="text-center text-sm mt-8" style={{ color: 'var(--hj-ink-soft)', fontFamily: 'DM Sans, sans-serif' }}>
          {t('noAccountText')}{' '}
          <button
            type="button"
            onClick={() => onNavigate?.('signup')}
            className="font-bold transition-colors focus:outline-none"
            style={{ color: '#F4831F' }}
            disabled={authLoading}
          >
            {t('signUpLinkText')}
          </button>
        </p>
      </div>
    </div>
  );
}
