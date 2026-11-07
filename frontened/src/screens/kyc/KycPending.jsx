import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Clock, ShieldCheck, CheckCircle, RefreshCw, AlertCircle,
  FileText, ArrowRight, MessageSquare, PhoneCall
} from 'lucide-react';

export default function KycPending({ onReupload, onExploreDashboard }) {
  const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const steps = [
    { title: 'DigiLocker / Aadhaar Authentication', status: 'completed', time: 'Just now' },
    { title: '3D Live Selfie & Face Match Check', status: 'completed', time: 'Just now' },
    { title: 'NSDL PAN & Bank Account Verification', status: 'completed', time: 'Just now' },
    { title: 'Admin Safety & Background Review', status: 'in_progress', eta: 'Typically 15–30 mins' },
  ];

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 animate-fade-in">
      {/* Header Badge */}
      <div
        className="rounded-3xl p-6 sm:p-8 mb-6 text-center space-y-4"
        style={{
          background: 'var(--hj-paper-card)',
          border: '1.5px solid var(--hj-line)',
          boxShadow: 'var(--hj-shadow-card)',
        }}
      >
        <div className="relative w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ background: 'rgba(244,131,31,0.12)' }}>
          <Clock size={40} style={{ color: '#F4831F' }} className="animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-[#F4831F]/40 animate-ping" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-2"
               style={{ background: 'rgba(244,131,31,0.15)', color: '#F4831F' }}>
            STATUS · APPLICATION UNDER REVIEW
          </div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold"
            style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}
          >
            Verification in Progress
          </h1>
          <p className="text-xs sm:text-sm mt-1 max-w-md mx-auto" style={{ color: 'var(--hj-ink-soft)' }}>
            Your documents and live selfie have been submitted. Our compliance team is verifying your profile to activate your Help Radar.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          style={{
            background: 'var(--hj-paper-warm)',
            border: '1px solid var(--hj-line)',
            color: 'var(--hj-ink)',
          }}
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Checking UIDAI Server...' : 'Check Live Status'}</span>
        </button>
      </div>

      {/* Verification Timeline Stages */}
      <div
        className="rounded-2xl p-5 sm:p-6 mb-6 space-y-4"
        style={{
          background: 'var(--hj-paper-card)',
          border: '1.5px solid var(--hj-line)',
          boxShadow: 'var(--hj-shadow-card)',
        }}
      >
        <div className="text-xs font-bold uppercase tracking-wider font-mono" style={{ color: 'var(--hj-ink-muted)' }}>
          VERIFICATION CHECKLIST
        </div>

        <div className="space-y-4">
          {steps.map((st, i) => (
            <div key={i} className="flex items-start gap-3">
              {st.status === 'completed' ? (
                <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-[#F4831F] shrink-0 mt-0.5 animate-spin border-t-transparent" />
              )}
              <div className="flex-1">
                <div className="text-xs sm:text-sm font-bold" style={{ color: 'var(--hj-ink)' }}>
                  {st.title}
                </div>
                <div className="text-[11px]" style={{ color: st.status === 'completed' ? '#1CA89C' : '#F4831F' }}>
                  {st.status === 'completed' ? `✓ Passed (${st.time})` : `⏳ ${st.eta}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={onExploreDashboard}
          className="w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2
                     transition-all active:scale-98 cursor-pointer shadow-lg"
          style={{ background: '#1CA89C' }}
        >
          <span>Preview Partner Dashboard</span>
          <ArrowRight size={16} />
        </button>

        <button
          type="button"
          onClick={onReupload}
          className="w-full py-3 rounded-xl font-semibold text-xs transition-colors cursor-pointer text-center"
          style={{
            background: 'transparent',
            color: 'var(--hj-ink-soft)',
            border: '1px solid var(--hj-line)',
          }}
        >
          Need to correct or re-upload documents? Click here
        </button>
      </div>
    </div>
  );
}
