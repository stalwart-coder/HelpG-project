import { useState } from 'react';
import {
  Sparkles, CheckCircle2, ArrowRight, ShieldCheck, MapPin,
  Navigation, CreditCard, Star, X, Briefcase, UserCheck, Radio
} from 'lucide-react';

export default function OnboardingGuide({ role = 'customer', onDismiss, onAction }) {
  const [slide, setSlide] = useState(0);

  const customerSlides = [
    {
      icon: '🔍',
      tag: 'STEP 1 · DISCOVER & CUSTOMIZE',
      title: 'Find Everyday Neighborhood Help',
      desc: 'Explore services like Steam Ironing, Quick Cleaning, Car Wash, or type in plain words what you need with our Smart Composer.',
      highlight: 'Transparent fixed pricing • Zero hidden fees',
    },
    {
      icon: '🚗',
      tag: 'STEP 2 · LIVE GPS TRACKING',
      title: 'Real-Time Helper on Map',
      desc: 'Watch your assigned verified helper navigate to your doorstep on a live interactive map with accurate minute-by-minute ETAs.',
      highlight: '100% Aadhaar Verified • Proximity dispatch',
    },
    {
      icon: '🛡️',
      tag: 'STEP 3 · SECURE OTP COMPLETION',
      title: 'Safe Task Completion & Payment',
      desc: 'Share your 4-digit PIN with the helper only after the chore is done to release payment securely from your HelpJi wallet.',
      highlight: 'Direct UPI refund protection • 24x7 SOS Safety',
    },
  ];

  const helperSlides = [
    {
      icon: '🛡️',
      tag: 'STEP 1 · AADHAAR & SELFIE KYC',
      title: 'Complete 2-Minute Verification',
      desc: 'Verify your Aadhaar with instant DigiLocker OTP and take a live selfie with liveness detection to unlock your verified badge.',
      highlight: 'Government compliant • Unlocks full customer trust',
    },
    {
      icon: '📡',
      tag: 'STEP 2 · HELP RADAR',
      title: 'Receive Nearby Local Tasks',
      desc: 'Turn on your availability to scan active micro-tasks within your 5 km neighborhood radius. Review distance and net payout before accepting.',
      highlight: 'Choose when & where you want to work',
    },
    {
      icon: '💰',
      tag: 'STEP 3 · INSTANT DAILY PAYOUTS',
      title: 'Daily Earnings Direct to UPI',
      desc: 'Complete tasks with customer OTP verification and withdraw your earnings directly to your bank account or UPI ID with 0% delay.',
      highlight: 'Transparent breakdown • No minimum withdrawal limits',
    },
  ];

  const slides = role === 'helper' ? helperSlides : customerSlides;
  const current = slides[slide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden"
        style={{
          background: 'var(--hj-paper-card)',
          border: '1.5px solid var(--hj-line)',
          boxShadow: 'var(--hj-shadow-float)',
        }}
      >
        {/* Dismiss 'X' Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          style={{ color: 'var(--hj-ink-muted)' }}
          title="Skip Walkthrough"
        >
          <X size={18} />
        </button>

        {/* Top Progress Dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === slide ? '28px' : '8px',
                background: i === slide ? (role === 'helper' ? '#1CA89C' : '#F4831F') : 'var(--hj-line)',
              }}
            />
          ))}
        </div>

        {/* Slide Visual Icon */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-md"
            style={{
              background: role === 'helper' ? 'rgba(28,168,156,0.15)' : 'rgba(244,131,31,0.15)',
              border: `1.5px solid ${role === 'helper' ? 'rgba(28,168,156,0.3)' : 'rgba(244,131,31,0.3)'}`,
            }}
          >
            {current.icon}
          </div>

          <div>
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-wider"
              style={{ color: role === 'helper' ? '#1CA89C' : '#F4831F' }}
            >
              {current.tag}
            </span>
            <h2
              className="text-xl sm:text-2xl font-extrabold"
              style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}
            >
              {current.title}
            </h2>
          </div>
        </div>

        {/* Description & Highlight */}
        <div className="space-y-3">
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--hj-ink-soft)' }}>
            {current.desc}
          </p>

          <div
            className="p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2"
            style={{
              background: 'var(--hj-paper-warm)',
              border: '1px solid var(--hj-line)',
              color: 'var(--hj-ink)',
            }}
          >
            <Sparkles size={14} style={{ color: role === 'helper' ? '#1CA89C' : '#F4831F' }} className="shrink-0" />
            <span>{current.highlight}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs font-bold transition-colors cursor-pointer"
            style={{ color: 'var(--hj-ink-muted)' }}
          >
            Skip for now
          </button>

          <button
            type="button"
            onClick={() => {
              if (slide < slides.length - 1) {
                setSlide(slide + 1);
              } else {
                onAction?.();
                onDismiss();
              }
            }}
            className="px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
            style={{ background: role === 'helper' ? '#1CA89C' : '#F4831F' }}
          >
            <span>{slide < slides.length - 1 ? 'Next' : 'Get Started'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
