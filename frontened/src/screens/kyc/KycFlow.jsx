import { useState } from 'react';
import KycPersonalInfo from './KycPersonalInfo';
import AadhaarUpload from './AadhaarUpload';
import PanUpload from './PanUpload';
import SelfieVerification from './SelfieVerification';
import BankDetails from './BankDetails';

// ── KYC Flow ────────────────────────────────────────────────────────────────
//
//  Steps: personal → aadhaar → pan → selfie → bank → complete
//
export default function KycFlow({ onComplete, onExit }) {
  const [step, setStep] = useState(0); // 0-4
  const [kycData, setKycData] = useState({});

  const steps = [
    { name: 'Personal Info', key: 'personal' },
    { name: 'Aadhaar', key: 'aadhaar' },
    { name: 'PAN', key: 'pan' },
    { name: 'Selfie', key: 'selfie' },
    { name: 'Bank / UPI', key: 'bank' },
  ];

  const handleNext = (data) => {
    const updated = { ...kycData, [steps[step].key]: data };
    setKycData(updated);

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete?.(updated);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      onExit?.();
    }
  };

  const stepPercent = Math.round(((step + 1) / steps.length) * 100);

  const commonProps = {
    onBack: handleBack,
    onNext: handleNext,
    initialData: kycData[steps[step]?.key] || {},
  };

  return (
    <div>
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-line px-5 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-semibold text-ink-soft uppercase tracking-wide">
            KYC Verification
          </span>
          <span className="text-[11px] font-mono font-bold text-ink">{stepPercent}%</span>
        </div>
        <div className="h-1.5 bg-line rounded-full overflow-hidden">
          <div
            className="h-full bg-marigold rounded-full transition-all duration-500 ease-out"
            style={{ width: `${stepPercent}%` }}
          />
        </div>
        <div className="flex gap-1 mt-2">
          {steps.map((s, i) => (
            <span
              key={s.key}
              className={`text-[9px] font-mono font-semibold uppercase flex-1 text-center transition-colors ${
                i <= step ? 'text-marigold-deep' : 'text-line'
              }`}
            >
              {i <= step ? '●' : '○'} {s.name}
            </span>
          ))}
        </div>
      </div>

      {step === 0 && <KycPersonalInfo {...commonProps} />}
      {step === 1 && <AadhaarUpload {...commonProps} />}
      {step === 2 && <PanUpload {...commonProps} />}
      {step === 3 && <SelfieVerification {...commonProps} />}
      {step === 4 && <BankDetails {...commonProps} />}
    </div>
  );
}

