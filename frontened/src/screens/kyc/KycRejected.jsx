import { useState, useEffect } from 'react';
import { XCircle, ChevronLeft, AlertTriangle, RefreshCw, FileText, Camera, User } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const rejectionReasons = [
  {
    id: 'aadhaar',
    icon: <FileText size={18} />,
    label: 'Aadhaar document',
    issue: 'Document is blurry or cropped',
    fix: 'Re-upload a clear photo showing all 4 corners of the Aadhaar card.',
  },
  {
    id: 'pan',
    icon: <FileText size={18} />,
    label: 'PAN card',
    issue: 'Name mismatch with Aadhaar',
    fix: 'Ensure the name on PAN exactly matches your Aadhaar name. Upload a clear image.',
  },
  {
    id: 'selfie',
    icon: <Camera size={18} />,
    label: 'Selfie verification',
    issue: 'Face not clearly visible',
    fix: 'Take a well-lit selfie against a plain background without glasses or mask.',
  },
  {
    id: 'personal',
    icon: <User size={18} />,
    label: 'Personal details',
    issue: 'Address does not match documents',
    fix: 'Verify your address matches the one on your Aadhaar or other submitted proof.',
  },
];

export default function KycRejected({ onBack, onRetry }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState('loading');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setStatus('ready'), 500);
    return () => clearTimeout(timer);
  }, []);

  if (status === 'loading') {
    return (
      <div className="p-5 min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <XCircle size={32} className="text-brick" />
          </div>
          <div className="h-5 w-48 bg-line/60 rounded-md animate-skeleton-pulse mx-auto" />
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

        {/* Rejected header */}
        <div className="bg-gradient-to-br from-brick to-rose-700 text-white rounded-2xl p-8 shadow-lift mb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-4">
            <XCircle size={44} className="text-white" />
          </div>
          <h2 className="text-[24px] font-display font-bold mb-2">
            KYC Not Approved
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Some of your documents could not be verified. Please review the
            issues below and re-submit corrected documents.
          </p>
        </div>

        {/* Quick stats */}
        <div className="bg-paper-card border border-line rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-brick flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold text-ink">{rejectionReasons.length} issues found</div>
            <div className="text-xs text-ink-soft">Fix and re-submit to continue</div>
          </div>
        </div>

        {/* Rejection reasons */}
        <div className="space-y-3 mb-6">
          {rejectionReasons.map((reason) => {
            const isExpanded = expanded === reason.id;
            return (
              <div
                key={reason.id}
                className="bg-paper-card border border-line rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : reason.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <span className="w-9 h-9 rounded-full bg-rose-50 text-brick flex items-center justify-center shrink-0">
                    {reason.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ink">{reason.label}</div>
                    <div className="text-xs text-brick">{reason.issue}</div>
                  </div>
                  <ChevronLeft
                    size={16}
                    className={`text-ink-soft shrink-0 transition-transform ${
                      isExpanded ? 'rotate-90' : '-rotate-90'
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-line/50">
                    <div className="flex items-start gap-2 mt-3">
                      <RefreshCw size={14} className="text-banyan mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-banyan mb-1">How to fix</div>
                        <p className="text-xs text-ink-soft leading-relaxed">{reason.fix}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <button
          onClick={onRetry}
          className="w-full bg-ink text-white py-3.5 rounded-xl font-bold text-[14.5px] shadow-card hover:shadow-lift transition-all active:scale-[.98] flex items-center justify-center gap-2"
        >
          <RefreshCw size={18} /> Re-submit KYC
        </button>
        <p className="text-center text-xs text-ink-soft mt-3">
          Need help? Contact{' '}
          <button className="text-ink font-semibold underline">support@helpji.in</button>
        </p>
      </div>
    </div>
  );
}

