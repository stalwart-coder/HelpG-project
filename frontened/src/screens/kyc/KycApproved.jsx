import { useState, useEffect } from 'react';
import { CheckCircle2, ChevronLeft, Star, Zap, Shield, Users } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function KycApproved({ onBack, onContinue }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const timer = setTimeout(() => setStatus('ready'), 600);
    return () => clearTimeout(timer);
  }, []);

  if (status === 'loading') {
    return (
      <div className="p-5 min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-banyan/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckCircle2 size={32} className="text-banyan" />
          </div>
          <div className="h-5 w-40 bg-line/60 rounded-md animate-skeleton-pulse mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 min-h-screen bg-paper flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-ink-soft text-sm mb-6"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {/* Success header */}
        <div className="bg-gradient-to-br from-banyan to-emerald-700 text-white rounded-2xl p-8 shadow-lift mb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={44} className="text-white" />
          </div>
          <h2 className="text-[24px] font-display font-bold mb-2">
            KYC Approved! ✅
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Your documents have been verified successfully. You can now
            start accepting tasks and earning on HelpJi.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-paper-card border border-line rounded-xl p-4">
            <Zap size={20} className="text-marigold-deep mb-2" />
            <div className="text-[18px] font-bold text-ink">Active</div>
            <div className="text-xs text-ink-soft">Account status</div>
          </div>
          <div className="bg-paper-card border border-line rounded-xl p-4">
            <Star size={20} className="text-marigold-deep mb-2" />
            <div className="text-[18px] font-bold text-ink">5.0</div>
            <div className="text-xs text-ink-soft">Starting rating</div>
          </div>
          <div className="bg-paper-card border border-line rounded-xl p-4">
            <Shield size={20} className="text-banyan mb-2" />
            <div className="text-[18px] font-bold text-ink">Verified</div>
            <div className="text-xs text-ink-soft">Trust badge</div>
          </div>
          <div className="bg-paper-card border border-line rounded-xl p-4">
            <Users size={20} className="text-banyan mb-2" />
            <div className="text-[18px] font-bold text-ink">1,200+</div>
            <div className="text-xs text-ink-soft">Customers near you</div>
          </div>
        </div>

        {/* What you can do now */}
        <div className="bg-paper-card border border-line rounded-xl p-5 shadow-card mb-6">
          <h3 className="font-semibold text-[15px] mb-3">What you can do now</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-banyan/15 text-banyan flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <div>
                <div className="text-sm font-semibold text-ink">Set your availability</div>
                <div className="text-xs text-ink-soft">Tell customers when you are free to work</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-banyan/15 text-banyan flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <div>
                <div className="text-sm font-semibold text-ink">Define service area</div>
                <div className="text-xs text-ink-soft">Choose which areas you want to serve</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-banyan/15 text-banyan flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <div>
                <div className="text-sm font-semibold text-ink">Start accepting tasks</div>
                <div className="text-xs text-ink-soft">Browse nearby tasks and start earning</div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full bg-banyan text-white py-3.5 rounded-xl font-bold text-[14.5px] shadow-card hover:shadow-lift transition-all active:scale-[.98]"
        >
          Start earning now
        </button>
      </div>
    </div>
  );
}

