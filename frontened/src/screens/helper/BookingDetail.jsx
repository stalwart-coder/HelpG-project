import { useMemo, useState } from 'react';
import {
  ChevronLeft, MapPin, Clock, User, Navigation, Phone, MessageSquare,
  ShieldCheck, CheckCircle2, KeyRound, AlertTriangle, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICE_LABELS } from '../../config/services';
import Timeline from '../../components/Timeline';
import HelperLiveNavMap from '../../components/HelperLiveNavMap';
import LiveChatDrawer from '../../components/LiveChatDrawer';
import { EmptyState, LoadingState, SuccessState } from '../../components/ui/PageState';

export default function BookingDetail({ booking, onBack, onAccept, onReject, onStart, onArrived, onComplete }) {
  const { lang } = useLanguage();

  const [currentStatus, setCurrentStatus] = useState(booking?.status || 'confirmed');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const resolvedBooking = booking || {
    id: 'HJ-8492',
    title: 'Steam Ironing (15 garments)',
    category: 'iron',
    status: currentStatus,
    price: 350,
    location: 'Flat 402, Green Glen Layout, Koramangala 4th Block',
    customer: { name: 'Aarav Sharma', rating: 4.8, phone: '9876543210' },
  };

  const label = SERVICE_LABELS[lang]?.[resolvedBooking.category] ?? SERVICE_LABELS.en[resolvedBooking.category] ?? 'Service';
  const customerName = resolvedBooking.customer?.name || 'Aarav Sharma';
  const customerPhone = resolvedBooking.customer?.phone || '9876543210';
  const customerRating = resolvedBooking.customer?.rating || 4.8;
  const netEarnings = Math.round((resolvedBooking.price || 350) * 0.88);

  const handleVerifyCompletionOtp = () => {
    if (inputOtp.length !== 4) {
      setOtpError('Please enter the 4-digit PIN provided by the customer.');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setCurrentStatus('completed');
      setShowOtpModal(false);
      onComplete?.();
    }, 1200);
  };

  const isNavigating = currentStatus !== 'completed';

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-28 animate-fade-in" style={{ color: 'var(--hj-ink)' }}>
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer"
          style={{ color: 'var(--hj-ink-soft)' }}
        >
          <ChevronLeft size={18} />
          <span>Back to Bookings</span>
        </button>

        <span className="text-xs font-mono font-bold text-[#1CA89C]">
          Order: {resolvedBooking.id || 'HJ-8492'}
        </span>
      </div>

      {/* ── 1. Helper Live Turn-By-Turn Navigation Map ── */}
      {isNavigating && (
        <HelperLiveNavMap
          booking={resolvedBooking}
          onArrived={() => {
            setCurrentStatus('in_progress');
            onArrived?.();
          }}
          onChat={() => setShowChatDrawer(true)}
        />
      )}

      {/* ── In-App Live Chat Drawer ── */}
      <LiveChatDrawer
        isOpen={showChatDrawer}
        onClose={() => setShowChatDrawer(false)}
        helper={{ name: 'You (Partner)', phone: '98290 41763', rating: 4.9 }}
        customer={resolvedBooking.customer}
        taskId={resolvedBooking.id || 'HJ-8492'}
      />

      {/* ── 2. Stage Progress & Task Details ── */}
      <div
        className="rounded-3xl p-6 mb-6 space-y-4"
        style={{
          background: 'var(--hj-paper-card)',
          border: '1.5px solid var(--hj-line)',
          boxShadow: 'var(--hj-shadow-card)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="px-2.5 py-0.5 rounded-md text-[11px] font-bold"
                style={{ background: 'rgba(28,168,156,0.12)', color: '#1CA89C', fontFamily: 'JetBrains Mono, monospace' }}
              >
                {label}
              </span>
              <span
                className="px-2.5 py-0.5 rounded-md text-[11px] font-bold"
                style={{
                  background: currentStatus === 'completed' ? 'rgba(34,197,94,0.15)' : 'rgba(244,131,31,0.15)',
                  color: currentStatus === 'completed' ? '#22C55E' : '#F4831F',
                }}
              >
                {currentStatus === 'completed' ? '✓ Task Completed' : currentStatus === 'in_progress' ? '● Work in Progress' : '🚗 On The Way'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold" style={{ fontFamily: 'Sora, sans-serif' }}>
              {resolvedBooking.title}
            </h1>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[10px] text-[var(--hj-ink-muted)]">Your Net Payout</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              ₹{netEarnings}
            </div>
          </div>
        </div>

        {/* Customer & Location */}
        <div className="p-4 rounded-2xl space-y-2 text-xs" style={{ background: 'var(--hj-paper-warm)', border: '1px solid var(--hj-line)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white" style={{ background: '#F4831F' }}>
                {customerName[0]}
              </div>
              <div>
                <div className="font-bold">{customerName}</div>
                <div className="text-[11px] text-[var(--hj-ink-muted)]">★ {customerRating} • Customer</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowChatDrawer(true)}
                className="p-2.5 rounded-xl border border-[var(--hj-line)] text-[var(--hj-ink)] bg-[var(--hj-paper-card)] cursor-pointer"
                title="Chat with Customer"
              >
                <MessageSquare size={14} />
              </button>
              <a
                href={`tel:${customerPhone}`}
                className="p-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                style={{ background: '#1CA89C' }}
              >
                <Phone size={13} />
                <span className="hidden sm:inline">Call</span>
              </a>
            </div>
          </div>

          <div className="pt-2 border-t flex items-center gap-1.5" style={{ borderColor: 'var(--hj-line)' }}>
            <MapPin size={14} style={{ color: '#F4831F' }} className="shrink-0" />
            <span className="font-medium truncate">{resolvedBooking.location}</span>
          </div>
        </div>

        {/* ── Action Stepper for Helper ── */}
        <div className="pt-2 space-y-2.5">
          {currentStatus === 'confirmed' && (
            <button
              type="button"
              onClick={() => {
                setCurrentStatus('in_progress');
                onArrived?.();
              }}
              className="w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
              style={{ background: '#1CA89C' }}
            >
              <Navigation size={16} />
              <span>Mark "Arrived at Doorstep"</span>
            </button>
          )}

          {currentStatus === 'in_progress' && (
            <button
              type="button"
              onClick={() => setShowOtpModal(true)}
              className="w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
              style={{ background: '#22C55E' }}
            >
              <CheckCircle2 size={18} />
              <span>Complete Task & Enter Customer OTP</span>
            </button>
          )}

          {currentStatus === 'completed' && (
            <div className="p-4 rounded-2xl text-center text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20">
              ✓ Payout of ₹{netEarnings} credited to your wallet balance.
            </div>
          )}
        </div>
      </div>

      {/* ── OTP Verification Modal ── */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-5 text-center"
            style={{
              background: 'var(--hj-paper-card)',
              border: '1.5px solid var(--hj-line)',
              boxShadow: 'var(--hj-shadow-float)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
              <KeyRound size={28} className="text-emerald-500" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold" style={{ fontFamily: 'Sora, sans-serif' }}>
                Enter Customer 4-Digit PIN
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--hj-ink-soft)' }}>
                Ask <strong className="text-[var(--hj-ink)]">{customerName}</strong> for their task completion PIN to verify finish and release payout.
              </p>
            </div>

            {otpError && (
              <div className="text-xs text-rose-500 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                {otpError}
              </div>
            )}

            <div className="max-w-xs mx-auto">
              <input
                type="text"
                value={inputOtp}
                onChange={(e) => {
                  setInputOtp(e.target.value.replace(/\D/g, '').slice(0, 4));
                  setOtpError('');
                }}
                placeholder="4829"
                maxLength={4}
                className="w-full px-4 py-3 rounded-2xl text-center text-3xl font-mono font-black tracking-widest outline-none"
                style={{
                  background: 'var(--hj-paper-warm)',
                  border: '2px solid #22C55E',
                  color: 'var(--hj-ink)',
                }}
              />
              <div className="text-[11px] mt-1 text-[var(--hj-ink-muted)]">
                Demo Customer PIN: <span className="font-mono font-bold text-emerald-400">4829</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-3 rounded-xl text-xs font-semibold cursor-pointer"
                style={{ background: 'var(--hj-paper-warm)', color: 'var(--hj-ink-soft)', border: '1px solid var(--hj-line)' }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleVerifyCompletionOtp}
                disabled={isVerifying || inputOtp.length !== 4}
                className="flex-2 py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                style={{ background: '#22C55E' }}
              >
                {isVerifying ? 'Verifying PIN...' : 'Verify & Release ₹' + netEarnings}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
