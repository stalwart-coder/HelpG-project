import { useState, useEffect } from 'react';
import {
  MapPin, Navigation, Phone, MessageSquare, ShieldAlert,
  Clock, CheckCircle2, AlertTriangle, ShieldCheck, Zap
} from 'lucide-react';

export default function LiveMapTracker({
  booking,
  helper,
  customerLocation = 'Koramangala 4th Block, Bengaluru',
  onCall,
  onChat,
  onCompleteWithOtp,
}) {
  const [progress, setProgress] = useState(0.25); // 0 (assigned) to 1 (arrived)
  const [currentStage, setCurrentStage] = useState('on_the_way');
  const [etaMins, setEtaMins] = useState(4);
  const [distanceRemainingKm, setDistanceRemainingKm] = useState(0.7);
  const [showSosModal, setShowSosModal] = useState(false);
  const [otp] = useState(booking?.otp || '4829');

  // Simulated smooth real-time progress along route
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.95) {
          setCurrentStage('arrived');
          setEtaMins(0);
          setDistanceRemainingKm(0.05);
          return 1;
        }
        const next = prev + 0.05;
        setDistanceRemainingKm(Number(Math.max(0.05, 0.7 * (1 - next)).toFixed(2)));
        setEtaMins(Math.max(1, Math.round(4 * (1 - next))));
        if (next > 0.7) setCurrentStage('nearby');
        return next;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  // Compute animated coordinates along a smooth SVG route
  // Path start (Helper): (80, 80) -> Curve through (200, 140) -> End (Doorstep): (340, 220)
  const startX = 60, startY = 60;
  const endX = 360, endY = 220;
  const currentX = startX + (endX - startX) * progress;
  const currentY = startY + (endY - startY) * progress + Math.sin(progress * Math.PI) * -30;

  const helperName = helper?.name || 'Ramesh Choudhary';
  const helperPhone = helper?.phone || '98290 41763';
  const helperRating = helper?.rating || 4.9;

  return (
    <div
      className="rounded-3xl overflow-hidden mb-6 transition-all"
      style={{
        background: 'var(--hj-paper-card)',
        border: '1.5px solid var(--hj-line)',
        boxShadow: 'var(--hj-shadow-raised)',
      }}
    >
      {/* ── Top Bar: Live ETA & Status Beacon ── */}
      <div
        className="p-4 sm:p-5 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--hj-line)', background: 'var(--hj-paper-warm)' }}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: '#1CA89C' }}>
            <Navigation size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1CA89C]">
              {currentStage === 'arrived' ? '🎉 HELPER HAS ARRIVED' : currentStage === 'nearby' ? '⚡ HELPER IS NEARBY' : '🚗 HELPER ON THE WAY'}
            </div>
            <div className="text-sm sm:text-base font-extrabold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}>
              {currentStage === 'arrived' ? 'At your doorstep' : `${etaMins} mins (${distanceRemainingKm} km away)`}
            </div>
          </div>
        </div>

        {/* SOS Emergency Button */}
        <button
          type="button"
          onClick={() => setShowSosModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.25)',
          }}
        >
          <ShieldAlert size={14} />
          <span>Safety SOS</span>
        </button>
      </div>

      {/* ── Interactive Vector Map Simulation ── */}
      <div className="relative w-full h-64 sm:h-72 bg-[#121624] overflow-hidden">
        {/* Map Grid / Streets Styling */}
        <svg className="w-full h-full" viewBox="0 0 420 280" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1CA89C" />
              <stop offset="100%" stopColor="#F4831F" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Road Network Lines */}
          <path d="M 0 40 Q 150 50 420 40" stroke="#1E2438" strokeWidth="18" fill="none" />
          <path d="M 0 160 Q 200 130 420 180" stroke="#1E2438" strokeWidth="22" fill="none" />
          <path d="M 80 0 L 120 280" stroke="#1E2438" strokeWidth="16" fill="none" />
          <path d="M 280 0 L 260 280" stroke="#1E2438" strokeWidth="20" fill="none" />

          {/* Neighborhood Buildings / Blocks */}
          <rect x="20" y="80" width="45" height="60" rx="6" fill="#181D30" />
          <rect x="140" y="10" width="70" height="40" rx="6" fill="#181D30" />
          <rect x="140" y="170" width="90" height="55" rx="6" fill="#181D30" />
          <rect x="300" y="30" width="60" height="70" rx="6" fill="#181D30" />
          <rect x="290" y="140" width="55" height="65" rx="6" fill="#181D30" />

          {/* Park / Green Area */}
          <path d="M 180 60 Q 240 70 230 110 Q 170 120 180 60 Z" fill="#142824" />
          <text x="185" y="90" fill="#22A355" fontSize="8" fontFamily="sans-serif" opacity="0.6">Koramangala Park</text>

          {/* Navigation Polyline Route */}
          <path
            d="M 60 60 Q 200 110 360 220"
            stroke="url(#routeGrad)"
            strokeWidth="5"
            strokeDasharray="6 4"
            fill="none"
            filter="url(#glow)"
          />

          {/* Customer Doorstep Marker */}
          <g transform="translate(360, 220)">
            <circle r="18" fill="rgba(244,131,31,0.25)" />
            <circle r="12" fill="#F4831F" />
            <circle r="4" fill="#FFFFFF" />
            <text x="-40" y="-18" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
              📍 Doorstep
            </text>
          </g>

          {/* Moving Helper Marker */}
          <g transform={`translate(${currentX}, ${currentY})`}>
            <circle r="20" fill="rgba(28,168,156,0.30)" className="animate-ping" />
            <circle r="14" fill="#1CA89C" />
            <text x="-5" y="4" fill="#FFFFFF" fontSize="11">🛵</text>
            <rect x="-35" y="-28" width="70" height="18" rx="6" fill="#1A1A2E" stroke="#1CA89C" strokeWidth="1" />
            <text x="-28" y="-16" fill="#1CA89C" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
              {helperName.split(' ')[0]} • {etaMins}m
            </text>
          </g>
        </svg>

        {/* Live Locality Tag Overlay */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] text-white flex items-center gap-1.5 font-medium border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live GPS Tracking • Koramangala 4th Block</span>
        </div>
      </div>

      {/* ── Secure Completion OTP Banner ── */}
      <div
        className="p-4 sm:p-5 border-t border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{
          background: 'rgba(244,131,31,0.08)',
          borderColor: 'var(--hj-line)',
        }}
      >
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#F4831F' }}>
            <ShieldCheck size={16} />
            <span>SECURE 4-DIGIT COMPLETION OTP</span>
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--hj-ink-soft)' }}>
            Share this PIN with your helper <strong className="text-[var(--hj-ink)]">only after task is fully completed</strong> to release payment.
          </div>
        </div>

        <div
          className="px-4 py-2 rounded-xl text-xl font-mono font-black tracking-widest self-center sm:self-auto shadow-sm"
          style={{
            background: 'var(--hj-paper-card)',
            color: '#F4831F',
            border: '1.5px solid #F4831F',
          }}
        >
          {otp}
        </div>
      </div>

      {/* ── Helper Contact & Identity Card ── */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md"
            style={{ background: 'linear-gradient(135deg, #1CA89C 0%, #157F75 100%)' }}
          >
            {helperName[0]}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold" style={{ color: 'var(--hj-ink)' }}>
                {helperName}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase" style={{ background: 'rgba(28,168,156,0.15)', color: '#1CA89C' }}>
                🛡️ Verified
              </span>
            </div>
            <div className="text-xs" style={{ color: 'var(--hj-ink-soft)' }}>
              ★ {helperRating} • 248 tasks completed
            </div>
          </div>
        </div>

        {/* Contact Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onChat}
            className="p-3 rounded-xl transition-all cursor-pointer active:scale-95"
            style={{
              background: 'var(--hj-paper-warm)',
              border: '1px solid var(--hj-line)',
              color: 'var(--hj-ink)',
            }}
            title="Chat with helper"
          >
            <MessageSquare size={16} />
          </button>

          <a
            href={`tel:${helperPhone}`}
            onClick={onCall}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl font-bold text-xs text-white transition-all cursor-pointer active:scale-95 shadow-md"
            style={{ background: '#1CA89C' }}
          >
            <Phone size={14} />
            <span className="hidden sm:inline">Call Helper</span>
          </a>
        </div>
      </div>

      {/* ── Safety SOS Modal ── */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md rounded-3xl p-6 space-y-4"
            style={{
              background: 'var(--hj-paper-card)',
              border: '1px solid var(--hj-line)',
              boxShadow: 'var(--hj-shadow-float)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <ShieldAlert size={30} className="text-red-500" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-red-500">24x7 Safety & Emergency Assistance</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--hj-ink-soft)' }}>
                Your live GPS location and helper details will be shared with the HelpJi Emergency Response Team and local authorities immediately.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href="tel:112"
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 bg-red-600 shadow-lg cursor-pointer"
              >
                <Phone size={16} />
                <span>Call Police Emergency (112)</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  alert('HelpJi Safety Desk alerted. A safety manager is calling you now.');
                  setShowSosModal(false);
                }}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: 'var(--hj-paper-warm)', color: 'var(--hj-ink)', border: '1px solid var(--hj-line)' }}
              >
                <span>Alert HelpJi Support Hotline</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="w-full py-2.5 text-xs font-semibold cursor-pointer"
                style={{ color: 'var(--hj-ink-muted)' }}
              >
                Cancel & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
