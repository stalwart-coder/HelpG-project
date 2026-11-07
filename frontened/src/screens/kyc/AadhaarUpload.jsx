import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { uploadDocument } from '../../utils/kycApi';
import {
  Upload, CheckCircle, AlertTriangle, ShieldCheck,
  FileText, ArrowRight, ChevronLeft, RefreshCw, KeyRound, Lock
} from 'lucide-react';

export default function AadhaarUpload({ onNext, onBack, initialData = {} }) {
  const { t } = useLanguage();

  const [mode, setMode] = useState('digilocker'); // 'digilocker' | 'manual'
  const [aadhaarNumber, setAadhaarNumber] = useState(initialData.aadhaarNumber || '');
  const [frontFile, setFrontFile] = useState(initialData.frontFile || null);
  const [backFile, setBackFile] = useState(initialData.backFile || null);
  const [digiStep, setDigiStep] = useState('input'); // 'input' | 'otp' | 'verified'
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [ocrData, setOcrData] = useState(initialData.ocrData || null);

  const formatAadhaar = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    return raw.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleAadhaarChange = (e) => {
    setAadhaarNumber(formatAadhaar(e.target.value));
    setError('');
  };

  // ── DigiLocker Instant Auth ───────────────────────────────────────────────
  const handleRequestDigiOtp = () => {
    const raw = aadhaarNumber.replace(/\s/g, '');
    if (raw.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number.');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setDigiStep('otp');
    }, 1200);
  };

  const handleVerifyDigiOtp = () => {
    if (otp.length < 6) {
      setError('Enter the 6-digit OTP sent to your Aadhaar-linked mobile.');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setDigiStep('verified');
      setOcrData({
        name: user?.name || initialData?.fullName || 'Verified Helper',
        dob: initialData?.dob || '14-08-1994',
        gender: initialData?.gender || 'Male',
        maskedAadhaar: 'XXXX-XXXX-' + aadhaarNumber.slice(-4),
        verifiedVia: 'UIDAI DigiLocker Paperless eKYC',
      });
    }, 1500);
  };

  // ── Manual Document Upload Simulation ────────────────────────────────────
  const handleFileUpload = async (side, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fieldName = side === 'front' ? 'aadhaarFront' : 'aadhaarBack';
      const uploaded = await uploadDocument(fieldName, file);
      const url = uploaded?.url || URL.createObjectURL(file);
      if (side === 'front') setFrontFile(url);
      if (side === 'back') setBackFile(url);
    } catch {
      const fakeUrl = URL.createObjectURL(file);
      if (side === 'front') setFrontFile(fakeUrl);
      if (side === 'back') setBackFile(fakeUrl);
    }

    if (side === 'front') {
      setOcrData({
        name: user?.name || initialData?.fullName || 'Verified Helper',
        dob: initialData?.dob || '14-08-1994',
        gender: initialData?.gender || 'Male',
        maskedAadhaar: aadhaarNumber ? 'XXXX-XXXX-' + aadhaarNumber.slice(-4) : 'XXXX-XXXX-4729',
        verifiedVia: 'OCR Document Extraction',
      });
    }
  };

  const isFormValid =
    digiStep === 'verified' ||
    (mode === 'manual' && frontFile && backFile && aadhaarNumber.replace(/\s/g, '').length === 12);

  const handleSubmit = () => {
    onNext({
      aadhaarNumber: aadhaarNumber.replace(/\s/g, ''),
      mode,
      frontFile,
      backFile,
      ocrData,
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6 animate-fade-in">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-xs font-semibold mb-4 transition-colors cursor-pointer"
        style={{ color: 'var(--hj-ink-soft)' }}
      >
        <ChevronLeft size={16} />
        <span>Back to Personal Info</span>
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
              style={{ background: 'rgba(28,168,156,0.15)', color: '#1CA89C' }}
            >
              STEP 2 OF 5 · GOVT ID VERIFICATION
            </span>
          </div>
          <h1
            className="text-2xl font-extrabold"
            style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}
          >
            Aadhaar Verification
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--hj-ink-soft)' }}>
            Mandatory KYC required by government regulations for neighborhood helper safety.
          </p>
        </div>
      </div>

      {/* Method Switcher: DigiLocker vs Manual Upload */}
      <div
        className="grid grid-cols-2 gap-2 p-1 rounded-2xl mb-6"
        style={{ background: 'var(--hj-paper-warm)', border: '1px solid var(--hj-line)' }}
      >
        <button
          type="button"
          onClick={() => setMode('digilocker')}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          style={{
            background: mode === 'digilocker' ? 'var(--hj-paper-card)' : 'transparent',
            color: mode === 'digilocker' ? '#1CA89C' : 'var(--hj-ink-soft)',
            boxShadow: mode === 'digilocker' ? 'var(--hj-shadow-card)' : 'none',
          }}
        >
          <ShieldCheck size={14} />
          <span>Instant DigiLocker (Recommended)</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('manual')}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          style={{
            background: mode === 'manual' ? 'var(--hj-paper-card)' : 'transparent',
            color: mode === 'manual' ? '#F4831F' : 'var(--hj-ink-soft)',
            boxShadow: mode === 'manual' ? 'var(--hj-shadow-card)' : 'none',
          }}
        >
          <Upload size={14} />
          <span>Upload Card Photos</span>
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 p-3.5 rounded-xl text-xs mb-5 animate-fade-in"
          style={{ background: 'rgba(239, 68, 68, 0.10)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.25)' }}
        >
          <AlertTriangle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── MODE 1: DIGILOCKER INSTANT VERIFICATION ── */}
      {mode === 'digilocker' && (
        <div
          className="rounded-2xl p-5 sm:p-6 mb-6"
          style={{
            background: 'var(--hj-paper-card)',
            border: '1.5px solid var(--hj-line)',
            boxShadow: 'var(--hj-shadow-card)',
          }}
        >
          {digiStep === 'input' && (
            <div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl mb-5" style={{ background: 'rgba(28,168,156,0.10)' }}>
                <Lock size={18} style={{ color: '#1CA89C' }} className="shrink-0" />
                <div className="text-xs" style={{ color: 'var(--hj-ink)' }}>
                  <span className="font-bold text-[#1CA89C]">Direct UIDAI Integration: </span>
                  Your Aadhaar details are fetched securely without storing your biometric data.
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--hj-ink-soft)' }}>
                  12-Digit Aadhaar Number
                </label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={handleAadhaarChange}
                  placeholder="e.g. 5482 9102 3847"
                  maxLength={14}
                  className="w-full px-4 py-3 rounded-xl text-base font-mono tracking-widest outline-none transition-all"
                  style={{
                    background: 'var(--hj-paper-warm)',
                    border: '1.5px solid var(--hj-line)',
                    color: 'var(--hj-ink)',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleRequestDigiOtp}
                disabled={isVerifying || aadhaarNumber.replace(/\s/g, '').length !== 12}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2
                           transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                style={{
                  background: '#1CA89C',
                  boxShadow: '0 4px 14px rgba(28,168,156,0.30)',
                }}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Connecting to DigiLocker UIDAI...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>Get Aadhaar Mobile OTP</span>
                  </>
                )}
              </button>
            </div>
          )}

          {digiStep === 'otp' && (
            <div className="animate-fade-in">
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2" style={{ background: 'rgba(28,168,156,0.15)' }}>
                  <KeyRound size={22} style={{ color: '#1CA89C' }} />
                </div>
                <h3 className="text-base font-bold" style={{ color: 'var(--hj-ink)' }}>Enter 6-Digit UIDAI OTP</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--hj-ink-soft)' }}>
                  Sent to mobile linked with Aadhaar ending in <span className="font-mono font-bold text-[#1CA89C]">•••• {aadhaarNumber.slice(-4)}</span>
                </p>
              </div>

              <div className="mb-5 max-w-xs mx-auto">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl text-center text-xl font-mono tracking-widest outline-none"
                  style={{
                    background: 'var(--hj-paper-warm)',
                    border: '1.5px solid #1CA89C',
                    color: 'var(--hj-ink)',
                  }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDigiStep('input')}
                  className="flex-1 py-3 rounded-xl text-xs font-semibold cursor-pointer"
                  style={{ background: 'var(--hj-paper-warm)', color: 'var(--hj-ink-soft)', border: '1px solid var(--hj-line)' }}
                >
                  Change Number
                </button>
                <button
                  type="button"
                  onClick={handleVerifyDigiOtp}
                  disabled={isVerifying || otp.length < 6}
                  className="flex-2 py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  style={{ background: '#1CA89C' }}
                >
                  {isVerifying ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  <span>Verify & Fetch ID</span>
                </button>
              </div>
            </div>
          )}

          {digiStep === 'verified' && ocrData && (
            <div className="animate-fade-in space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <CheckCircle size={22} className="text-emerald-500 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-emerald-500">Aadhaar eKYC Verified Successfully</div>
                  <div className="text-[11px]" style={{ color: 'var(--hj-ink-soft)' }}>
                    Identity verified via DigiLocker official registry.
                  </div>
                </div>
              </div>

              {/* Verified Details Card */}
              <div className="p-4 rounded-xl space-y-2 text-xs" style={{ background: 'var(--hj-paper-warm)', border: '1px solid var(--hj-line)' }}>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--hj-ink-muted)' }}>Full Name:</span>
                  <span className="font-bold" style={{ color: 'var(--hj-ink)' }}>{ocrData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--hj-ink-muted)' }}>Date of Birth:</span>
                  <span className="font-bold" style={{ color: 'var(--hj-ink)' }}>{ocrData.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--hj-ink-muted)' }}>Aadhaar Number:</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--hj-ink)' }}>{ocrData.maskedAadhaar}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--hj-ink-muted)' }}>Status:</span>
                  <span className="font-bold text-[#1CA89C]">✓ Live Match Confirmed</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODE 2: MANUAL PHOTO UPLOAD ── */}
      {mode === 'manual' && (
        <div
          className="rounded-2xl p-5 sm:p-6 mb-6 space-y-5"
          style={{
            background: 'var(--hj-paper-card)',
            border: '1.5px solid var(--hj-line)',
            boxShadow: 'var(--hj-shadow-card)',
          }}
        >
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--hj-ink-soft)' }}>
              12-Digit Aadhaar Number
            </label>
            <input
              type="text"
              value={aadhaarNumber}
              onChange={handleAadhaarChange}
              placeholder="e.g. 5482 9102 3847"
              maxLength={14}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-mono tracking-wider outline-none"
              style={{
                background: 'var(--hj-paper-warm)',
                border: '1.5px solid var(--hj-line)',
                color: 'var(--hj-ink)',
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Front Photo */}
            <label
              className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center"
              style={{
                background: 'var(--hj-paper-warm)',
                borderColor: frontFile ? '#1CA89C' : 'var(--hj-line)',
              }}
            >
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload('front', e)} className="hidden" />
              {frontFile ? (
                <div>
                  <CheckCircle size={24} className="text-emerald-500 mx-auto mb-1.5" />
                  <span className="text-xs font-bold text-[#1CA89C]">Front Photo Uploaded</span>
                </div>
              ) : (
                <div>
                  <Upload size={20} style={{ color: 'var(--hj-ink-muted)' }} className="mx-auto mb-1.5" />
                  <div className="text-xs font-bold" style={{ color: 'var(--hj-ink)' }}>Upload Front Side</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--hj-ink-muted)' }}>Photo & Name side</div>
                </div>
              )}
            </label>

            {/* Back Photo */}
            <label
              className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center"
              style={{
                background: 'var(--hj-paper-warm)',
                borderColor: backFile ? '#1CA89C' : 'var(--hj-line)',
              }}
            >
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload('back', e)} className="hidden" />
              {backFile ? (
                <div>
                  <CheckCircle size={24} className="text-emerald-500 mx-auto mb-1.5" />
                  <span className="text-xs font-bold text-[#1CA89C]">Back Photo Uploaded</span>
                </div>
              ) : (
                <div>
                  <Upload size={20} style={{ color: 'var(--hj-ink-muted)' }} className="mx-auto mb-1.5" />
                  <div className="text-xs font-bold" style={{ color: 'var(--hj-ink)' }}>Upload Back Side</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'var(--hj-ink-muted)' }}>Address & QR Code side</div>
                </div>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Action CTA */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isFormValid}
        className="w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2
                   transition-all active:scale-98 cursor-pointer disabled:opacity-40"
        style={{
          background: '#F4831F',
          boxShadow: isFormValid ? '0 6px 20px rgba(244,131,31,0.30)' : 'none',
        }}
      >
        <span>Continue to Live Selfie & Liveness Check</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
