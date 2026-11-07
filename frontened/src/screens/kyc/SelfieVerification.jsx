import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Camera, CheckCircle, RefreshCw, AlertTriangle, ShieldCheck,
  ChevronLeft, ArrowRight, UserCheck, Sparkles, Smile
} from 'lucide-react';

export default function SelfieVerification({ onNext, onBack, initialData = {} }) {
  const { t } = useLanguage();

  const [step, setStep] = useState('instructions'); // 'instructions' | 'capturing' | 'liveness' | 'verified'
  const [livenessStage, setLivenessStage] = useState(0); // 0: look straight, 1: blink eyes, 2: smile
  const [capturedPhoto, setCapturedPhoto] = useState(initialData.selfieUrl || null);
  const [matchScore, setMatchScore] = useState(initialData.matchScore || 98.4);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);

  const LIVENESS_PROMPTS = [
    { title: 'Look directly at camera', instruction: 'Align your face in the oval guide' },
    { title: 'Blink your eyes twice', instruction: 'Verifying live human presence...' },
    { title: 'Give a gentle smile', instruction: 'Finalizing 3D depth and liveness...' },
  ];

  // Simulated live camera / prompt progression
  const startCamera = async () => {
    setStep('capturing');
    setError('');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      }
    } catch {
      // Fallback gracefully if camera permissions denied in browser
      setCameraActive(false);
    }
  };

  const startLivenessCheck = () => {
    setStep('liveness');
    setLivenessStage(0);

    setTimeout(() => {
      setLivenessStage(1);
      setTimeout(() => {
        setLivenessStage(2);
        setTimeout(() => {
          setCapturedPhoto('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80');
          setMatchScore(98.6);
          setStep('verified');
        }, 1200);
      }, 1200);
    }, 1200);
  };

  const handleSubmit = () => {
    onNext({
      selfieUrl: capturedPhoto,
      matchScore,
      isLiveVerified: true,
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
        <span>Back to Aadhaar Verification</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <span
          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider"
          style={{ background: 'rgba(244,131,31,0.15)', color: '#F4831F' }}
        >
          STEP 3 OF 5 · LIVE SELFIE & LIVENESS
        </span>
        <h1
          className="text-2xl font-extrabold mt-1"
          style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}
        >
          Live Photo & Face Match
        </h1>
        <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--hj-ink-soft)' }}>
          Quick 10-second liveness check to ensure your identity matches your Aadhaar ID.
        </p>
      </div>

      {/* Instructions Card */}
      {step === 'instructions' && (
        <div
          className="rounded-2xl p-6 mb-6 space-y-5"
          style={{
            background: 'var(--hj-paper-card)',
            border: '1.5px solid var(--hj-line)',
            boxShadow: 'var(--hj-shadow-card)',
          }}
        >
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(28,168,156,0.15)' }}>
            <Camera size={36} style={{ color: '#1CA89C' }} />
          </div>

          <div className="space-y-2.5 text-xs" style={{ color: 'var(--hj-ink-soft)' }}>
            <div className="flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-500 shrink-0" />
              <span>Ensure good lighting and remove glasses/cap.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-500 shrink-0" />
              <span>Look directly into the camera and follow on-screen prompts.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-500 shrink-0" />
              <span>AI face matching matches your live selfie with your government ID.</span>
            </div>
          </div>

          <button
            type="button"
            onClick={startCamera}
            className="w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2
                       transition-all active:scale-98 cursor-pointer shadow-lg"
            style={{ background: '#1CA89C' }}
          >
            <Camera size={16} />
            <span>Open Camera & Start Liveness Test</span>
          </button>
        </div>
      )}

      {/* Camera / Capturing Stage */}
      {step === 'capturing' && (
        <div
          className="rounded-2xl p-6 mb-6 text-center space-y-4"
          style={{
            background: 'var(--hj-paper-card)',
            border: '1.5px solid var(--hj-line)',
            boxShadow: 'var(--hj-shadow-card)',
          }}
        >
          {/* Oval Face Guide */}
          <div className="relative w-56 h-72 mx-auto rounded-[100px] border-4 border-dashed border-[#1CA89C] flex items-center justify-center overflow-hidden bg-black/50">
            {cameraActive ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <Camera size={40} className="text-white/60 mx-auto mb-2 animate-bounce" />
                <div className="text-xs text-white font-medium">Position Face in Oval</div>
              </div>
            )}
            <div className="absolute inset-0 border-4 rounded-[100px] pointer-events-none border-[#1CA89C]/30 animate-pulse" />
          </div>

          <p className="text-xs" style={{ color: 'var(--hj-ink-soft)' }}>
            Hold phone at eye level. Ready for the 3-step liveness scan?
          </p>

          <button
            type="button"
            onClick={startLivenessCheck}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2
                       transition-all active:scale-98 cursor-pointer"
            style={{ background: '#F4831F' }}
          >
            <Sparkles size={16} />
            <span>Begin Liveness Verification</span>
          </button>
        </div>
      )}

      {/* Liveness Prompts Progression */}
      {step === 'liveness' && (
        <div
          className="rounded-2xl p-6 mb-6 text-center space-y-5"
          style={{
            background: 'var(--hj-paper-card)',
            border: '1.5px solid #1CA89C',
            boxShadow: '0 8px 30px rgba(28,168,156,0.20)',
          }}
        >
          <div className="relative w-48 h-60 mx-auto rounded-[90px] border-4 border-[#1CA89C] flex items-center justify-center overflow-hidden bg-slate-950">
            <RefreshCw size={36} className="text-emerald-400 animate-spin" />
            <div className="absolute bottom-3 px-3 py-1 rounded-full bg-black/60 text-[10px] text-white font-mono">
              Step {livenessStage + 1} of 3
            </div>
          </div>

          <div>
            <div className="text-base font-extrabold text-[#1CA89C]" style={{ fontFamily: 'Sora, sans-serif' }}>
              {LIVENESS_PROMPTS[livenessStage].title}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--hj-ink-soft)' }}>
              {LIVENESS_PROMPTS[livenessStage].instruction}
            </div>
          </div>

          <div className="h-1.5 bg-line rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${((livenessStage + 1) / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step: Verified */}
      {step === 'verified' && (
        <div
          className="rounded-2xl p-6 mb-6 space-y-5 animate-fade-in"
          style={{
            background: 'var(--hj-paper-card)',
            border: '1.5px solid var(--hj-line)',
            boxShadow: 'var(--hj-shadow-card)',
          }}
        >
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
            <UserCheck size={26} className="text-emerald-500 shrink-0" />
            <div>
              <div className="text-sm font-bold text-emerald-500">Selfie & Face Match Verified</div>
              <div className="text-xs" style={{ color: 'var(--hj-ink-soft)' }}>
                3D Liveness score confirmed with zero biometric discrepancies.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--hj-paper-warm)', border: '1px solid var(--hj-line)' }}>
            <img
              src={capturedPhoto}
              alt="Verified Selfie"
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shrink-0"
            />
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5">
                <span style={{ color: 'var(--hj-ink-muted)' }}>Face Match:</span>
                <span className="font-mono font-bold text-emerald-500">{matchScore}% (High Confidence)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ color: 'var(--hj-ink-muted)' }}>Liveness:</span>
                <span className="font-semibold" style={{ color: 'var(--hj-ink)' }}>✓ Genuine Live Human</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span style={{ color: 'var(--hj-ink-muted)' }}>Aadhaar Match:</span>
                <span className="font-semibold text-[#1CA89C]">✓ Verified with ID photo</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2
                       transition-all active:scale-98 cursor-pointer shadow-lg"
            style={{ background: '#F4831F' }}
          >
            <span>Continue to Bank & UPI Settlement</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
