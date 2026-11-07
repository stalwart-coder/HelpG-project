import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Loader2, AlertTriangle, ChevronLeft, Eye, EyeOff, Check,
  User, Briefcase, Sparkles, ShieldCheck, ArrowRight, MapPin
} from 'lucide-react';
import { LOCALITIES } from '../../data/mockData';
import { SERVICES } from '../../config/services';

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-500 animate-fade-in">
      <AlertTriangle size={13} /> {msg}
    </div>
  );
}

export default function Signup({ onNavigate }) {
  const { t } = useLanguage();
  const { signup, sendOtp, loginWithGoogle, authLoading, authError, clearError } = useAuth();

  // Role: 'customer' | 'helper'
  const [role, setRole] = useState('customer');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [locality, setLocality] = useState(LOCALITIES[0] || 'Koramangala, Bengaluru');
  const [primarySkill, setPrimarySkill] = useState('iron');
  const [vehicle, setVehicle] = useState('scooter');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [touched, setTouched] = useState({});
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [otp, setOtp] = useState('');

  // ── Validation ────────────────────────────────────────────────────────────
  const errors = {};
  const nameTrim = name.trim();
  if (!nameTrim) errors.name = 'Full name is required.';
  else if (nameTrim.length < 2) errors.name = 'Name must be at least 2 characters.';

  const phoneTrim = phone.trim();
  if (!phoneTrim) errors.phone = 'Phone number is required.';
  else if (phoneTrim.length !== 10) errors.phone = 'Enter a valid 10-digit mobile number.';

  if (!password.trim()) errors.password = 'Password is required.';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';

  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.';
  if (!acceptTerms) errors.terms = 'You must accept the Terms of Service & Privacy Policy.';

  const canSubmit = Object.keys(errors).length === 0 && !authLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, phone: true, password: true, confirmPassword: true, terms: true });
    if (!canSubmit) return;
    clearError();

    // Send OTP verification
    const otpSent = await sendOtp('+91' + phoneTrim);
    if (otpSent) {
      setStep('otp');
    }
  };

  const handleOtpVerify = async () => {
    clearError();
    if (otp.length !== 6) return;

    const payload = {
      name: nameTrim,
      phone: '+91' + phoneTrim,
      email: email.trim(),
      password,
      role, // 'customer' | 'helper'
      location: locality,
      skills: role === 'helper' ? [primarySkill] : [],
      vehicle: role === 'helper' ? vehicle : null,
      isVerified: false,
    };

    const success = await signup(payload);
    if (success) {
      if (role === 'helper') {
        window.location.href = '/helper/home';
      } else {
        window.location.href = '/customer/home';
      }
    }
  };

  const handleGoogleSignup = async () => {
    if (authLoading) return;
    clearError();
    const res = await loginWithGoogle(role);
    if (res?.success) {
      if (role === 'helper' || res.user?.role === 'helper') {
        window.location.href = '/helper/home';
      } else {
        window.location.href = '/customer/home';
      }
    }
  };

  return (
    <div
      className="min-h-screen p-4 sm:p-6 flex flex-col justify-center items-center transition-colors"
      style={{ background: 'var(--hj-paper)', color: 'var(--hj-ink)' }}
    >
      <div
        className="w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-6"
        style={{
          background: 'var(--hj-paper-card)',
          border: '1.5px solid var(--hj-line)',
          boxShadow: 'var(--hj-shadow-float)',
        }}
      >
        {/* Back Link */}
        <button
          type="button"
          onClick={() => onNavigate?.('login')}
          className="flex items-center gap-1 text-xs font-semibold cursor-pointer"
          style={{ color: 'var(--hj-ink-soft)' }}
        >
          <ChevronLeft size={16} /> {t('backToLogin')}
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm text-white" style={{ background: '#F4831F' }}>
              H
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F4831F]">
              {t('brandName')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ fontFamily: 'Sora, sans-serif' }}>
            {t('signupHeading')}
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--hj-ink-soft)' }}>
            {t('signupSubtext')}
          </p>
        </div>

        {authError && (
          <div className="flex items-center gap-2 bg-rose-500/10 text-rose-500 p-3.5 rounded-xl text-xs border border-rose-500/20">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* ── STEP 1: UPFRONT ROLE CHOOSER ── */}
        <div>
          <label className="block text-xs font-bold uppercase font-mono mb-2" style={{ color: 'var(--hj-ink-muted)' }}>
            {t('joiningAsLabel')}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Customer Option */}
            <div
              onClick={() => setRole('customer')}
              role="button"
              tabIndex={0}
              className="p-4 rounded-2xl cursor-pointer transition-all duration-200 flex items-start gap-3"
              style={{
                background: role === 'customer' ? 'rgba(244,131,31,0.10)' : 'var(--hj-paper-warm)',
                border: role === 'customer' ? '2px solid #F4831F' : '1.5px solid var(--hj-line)',
                boxShadow: role === 'customer' ? '0 4px 14px rgba(244,131,31,0.15)' : 'none',
              }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shrink-0" style={{ background: '#F4831F', color: 'white' }}>
                🙋
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--hj-ink)' }}>
                  <span>{t('customerRoleTitle')}</span>
                  <span className="text-[10px] font-mono uppercase text-[#F4831F] font-bold">Customer</span>
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--hj-ink-soft)' }}>
                  {t('customerRoleSubtitle')}
                </div>
              </div>
            </div>

            {/* Helper Option */}
            <div
              onClick={() => setRole('helper')}
              role="button"
              tabIndex={0}
              className="p-4 rounded-2xl cursor-pointer transition-all duration-200 flex items-start gap-3"
              style={{
                background: role === 'helper' ? 'rgba(28,168,156,0.10)' : 'var(--hj-paper-warm)',
                border: role === 'helper' ? '2px solid #1CA89C' : '1.5px solid var(--hj-line)',
                boxShadow: role === 'helper' ? '0 4px 14px rgba(28,168,156,0.15)' : 'none',
              }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-lg shrink-0" style={{ background: '#1CA89C', color: 'white' }}>
                🛠️
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'var(--hj-ink)' }}>
                  <span>{t('helperRoleTitle')}</span>
                  <span className="text-[10px] font-mono uppercase text-[#1CA89C] font-bold">Helper</span>
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--hj-ink-soft)' }}>
                  {t('helperRoleSubtitle')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── STEP 2: REGISTRATION FORM ── */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--hj-ink-soft)' }}>
                {t('fullNameLabel')}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Choudhary"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--hj-paper-warm)',
                  border: '1.5px solid var(--hj-line)',
                  color: 'var(--hj-ink)',
                }}
              />
              <FieldError msg={touched.name && errors.name ? errors.name : ''} />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--hj-ink-soft)' }}>
                {t('phoneLabel')}
              </label>
              <div className="flex gap-2">
                <div className="px-3 py-2.5 rounded-xl text-sm font-mono font-bold flex items-center shrink-0" style={{ background: 'var(--hj-paper-warm)', border: '1.5px solid var(--hj-line)', color: 'var(--hj-ink)' }}>
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-mono tracking-wider outline-none"
                  style={{
                    background: 'var(--hj-paper-warm)',
                    border: '1.5px solid var(--hj-line)',
                    color: 'var(--hj-ink)',
                  }}
                />
              </div>
              <FieldError msg={touched.phone && errors.phone ? errors.phone : ''} />
            </div>

            {/* Locality */}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--hj-ink-soft)' }}>
                {t('primaryCityLabel')}
              </label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
                style={{
                  background: 'var(--hj-paper-warm)',
                  border: '1.5px solid var(--hj-line)',
                  color: 'var(--hj-ink)',
                }}
              >
                {LOCALITIES.map((loc) => (
                  <option key={loc} value={loc} className="bg-[var(--hj-paper-card)] text-[var(--hj-ink)]">
                    📍 {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Helper-Specific Fields */}
            {role === 'helper' && (
              <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(28,168,156,0.08)', border: '1px solid rgba(28,168,156,0.25)' }}>
                <div className="text-xs font-bold text-[#1CA89C]">{t('helperProfileHeading')}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--hj-ink-soft)' }}>{t('primarySkillLabel')}</label>
                    <select
                      value={primarySkill}
                      onChange={(e) => setPrimarySkill(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs outline-none cursor-pointer"
                      style={{ background: 'var(--hj-paper-card)', border: '1px solid var(--hj-line)', color: 'var(--hj-ink)' }}
                    >
                      {SERVICES.map((s) => (
                        <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--hj-ink-soft)' }}>{t('travelModeLabel')}</label>
                    <select
                      value={vehicle}
                      onChange={(e) => setVehicle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs outline-none cursor-pointer"
                      style={{ background: 'var(--hj-paper-card)', border: '1px solid var(--hj-line)', color: 'var(--hj-ink)' }}
                    >
                      <option value="scooter">🛵 Two-Wheeler / Bike</option>
                      <option value="bicycle">🚲 Bicycle</option>
                      <option value="walking">🚶 Walking Distance (&lt;1.5km)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--hj-ink-soft)' }}>
                  {t('passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--hj-paper-warm)', border: '1.5px solid var(--hj-line)', color: 'var(--hj-ink)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-xs"
                    style={{ color: 'var(--hj-ink-muted)' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <FieldError msg={touched.password && errors.password ? errors.password : ''} />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--hj-ink-soft)' }}>
                  {t('confirmPasswordLabel')}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--hj-paper-warm)', border: '1.5px solid var(--hj-line)', color: 'var(--hj-ink)' }}
                />
                <FieldError msg={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : ''} />
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2 text-xs cursor-pointer pt-1" style={{ color: 'var(--hj-ink-soft)' }}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded text-[#F4831F]"
              />
              <span>{t('termsAgreement')}</span>
            </label>
            <FieldError msg={touched.terms && errors.terms ? errors.terms : ''} />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2
                         transition-all active:scale-98 cursor-pointer shadow-lg mt-2"
              style={{ background: role === 'helper' ? '#1CA89C' : '#F4831F' }}
            >
              {authLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t('loadingText')}</span>
                </>
              ) : (
                <>
                  <span>{t('createAccountSubmit')} ({role === 'helper' ? 'Partner' : 'Customer'})</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ background: 'var(--hj-line)' }} />
              <span className="text-[12px] font-medium" style={{ color: 'var(--hj-ink-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                {t('orContinueWith')}
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--hj-line)' }} />
            </div>

            {/* Google Signup Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={authLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
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
              <span>{t('googleAuth')}</span>
            </button>
          </form>
        )}

        {/* ── STEP 3: OTP VERIFICATION MODAL / VIEW ── */}
        {step === 'otp' && (
          <div className="space-y-5 animate-fade-in text-center py-2">
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(244,131,31,0.15)' }}>
              <ShieldCheck size={28} style={{ color: '#F4831F' }} />
            </div>

            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--hj-ink)' }}>{t('verifyMobileTitle')}</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--hj-ink-soft)' }}>
                {t('otpSentNotice')} <span className="font-mono font-bold text-[#F4831F]">+91 {phone}</span>
              </p>
            </div>

            <div className="max-w-xs mx-auto">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t('otpPlaceholder')}
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl text-center text-2xl font-mono tracking-widest outline-none"
                style={{
                  background: 'var(--hj-paper-warm)',
                  border: '2px solid #F4831F',
                  color: 'var(--hj-ink)',
                }}
              />
              <div className="text-[11px] mt-1.5" style={{ color: 'var(--hj-ink-muted)' }}>
                Demo Verification Code: <span className="font-mono font-bold">123456</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="flex-1 py-3 rounded-xl text-xs font-semibold cursor-pointer"
                style={{ background: 'var(--hj-paper-warm)', color: 'var(--hj-ink-soft)', border: '1px solid var(--hj-line)' }}
              >
                Back to Edit
              </button>

              <button
                type="button"
                onClick={handleOtpVerify}
                disabled={authLoading || otp.length < 6}
                className="flex-2 py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{ background: role === 'helper' ? '#1CA89C' : '#F4831F' }}
              >
                {authLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>{t('verifyOtpSubmit')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
