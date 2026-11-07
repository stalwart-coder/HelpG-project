import { useState, useEffect } from 'react';
import { Phone, Shield, AlertTriangle, ChevronLeft, MapPin, User, Clock, Loader2, CheckCircle2, X, Send } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

const SOS_CONTACTS = [
  { name: 'Police', number: '100', icon: '🚔', color: 'bg-blue-600' },
  { name: 'Ambulance', number: '108', icon: '🚑', color: 'bg-rose-600' },
  { name: 'Fire', number: '101', icon: '🔥', color: 'bg-orange-600' },
  { name: 'Women Helpline', number: '181', icon: '👩', color: 'bg-pink-600' },
];

const SUPPORT_CONTACTS = [
  { name: 'HelpJi Support', number: '+91 9532094712', label: '24/7 Helpline' },
  { name: 'Safety Team', number: '+91 8000000013', label: 'Emergency Assistance' },
];

export default function SOSScreen({ onBack }) {
  const { t } = useLanguage();
  const [step, setStep] = useState('landing'); // landing | activating | active | sent | confirm
  const [timer, setTimer] = useState(5);
  const [location, setLocation] = useState(null);

  // Simulate location fetch
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setLocation(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`),
        () => setLocation('Location access denied'),
        { timeout: 5000 }
      );
    } else {
      setLocation('Location unavailable');
    }
  }, []);

  // Timer countdown for activation
  useEffect(() => {
    if (step !== 'activating') return;
    if (timer <= 0) {
      setStep('active');
      return;
    }
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleActivate = () => {
    setStep('activating');
    setTimer(5);
  };

  const handleCancel = () => {
    setStep('landing');
    setTimer(5);
  };

  const handleSendAlert = () => {
    setStep('sent');
    setTimeout(() => {
      setStep('confirm');
    }, 2000);
  };

  if (step === 'sent') {
    return (
      <div className="min-h-screen bg-brick flex items-center justify-center p-5">
        <div className="text-center text-white">
          <Loader2 size={48} className="animate-spin mx-auto mb-4" />
          <h2 className="text-[22px] font-display font-bold mb-2">Sending SOS alert...</h2>
          <p className="text-white/80">Notifying your emergency contacts and HelpJi safety team.</p>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-brick flex items-center justify-center p-5">
        <div className="text-center text-white max-w-sm">
          <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={44} className="text-white" />
          </div>
          <h2 className="text-[22px] font-display font-bold mb-2">SOS Alert Sent! 🆘</h2>
          <p className="text-white/80 text-sm mb-6">
            Your emergency contacts and HelpJi safety team have been notified with your location.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 text-sm mb-2">
              <MapPin size={16} /> Location: {location || 'Fetching...'}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} /> Sent at: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-3.5 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10"
            >
              Cancel alert
            </button>
            <button
              onClick={onBack}
              className="flex-1 py-3.5 rounded-xl bg-white text-brick font-bold text-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-line px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-ink-soft hover:text-ink">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-[20px] font-display font-semibold">SOS Emergency</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-5">
        <div className="w-full max-w-md">
          {/* SOS Button */}
          <div className="text-center mb-8">
            {step === 'activating' ? (
              <div className="animate-scale-in">
                <div className="w-44 h-44 rounded-full bg-gradient-to-br from-brick to-rose-600 flex items-center justify-center mx-auto mb-5 shadow-lift-lg animate-pulse">
                  <div className="text-center text-white">
                    <div className="text-[48px] font-bold font-display">{timer}</div>
                    <div className="text-sm text-white/80">seconds</div>
                  </div>
                </div>
                <p className="text-sm text-ink-soft mb-4">SOS will activate automatically</p>
              </div>
            ) : step === 'active' ? (
              <div className="animate-scale-in">
                <div className="w-44 h-44 rounded-full bg-gradient-to-br from-brick to-rose-600 flex items-center justify-center mx-auto mb-5 shadow-lift-lg animate-pulse ring-4 ring-brick/30">
                  <div className="text-center text-white">
                    <AlertTriangle size={44} className="mx-auto mb-1" />
                    <div className="text-[11px] font-bold uppercase tracking-wide">Active</div>
                  </div>
                </div>
                <p className="text-sm font-semibold text-brick mb-1">SOS Active — Alert Ready</p>
                <p className="text-xs text-ink-soft mb-4">Press "Send SOS" to alert emergency contacts</p>
              </div>
            ) : (
              <>
                <div className="w-44 h-44 rounded-full bg-gradient-to-br from-brick to-rose-600 flex items-center justify-center mx-auto mb-5 shadow-lift-lg cursor-pointer hover:scale-105 transition-transform active:scale-95"
                  onClick={handleActivate}
                >
                  <div className="text-center text-white">
                    <AlertTriangle size={48} className="mx-auto mb-1" />
                    <div className="text-[18px] font-bold">SOS</div>
                    <div className="text-[11px] text-white/80">Tap to activate</div>
                  </div>
                </div>
                <p className="text-sm text-ink-soft mb-1">Tap the SOS button in case of emergency</p>
                <p className="text-xs text-ink-soft">Your location will be shared with emergency contacts</p>
              </>
            )}
          </div>

          {/* Action buttons */}
          {step === 'landing' && (
            <button
              onClick={handleActivate}
              className="w-full bg-brick text-white py-4 rounded-2xl font-bold text-[16px] shadow-lift hover:shadow-lift-lg transition-all active:scale-[.98] mb-3"
            >
              🚨 Activate SOS
            </button>
          )}

          {step === 'activating' && (
            <button
              onClick={handleCancel}
              className="w-full bg-white border-2 border-brick text-brick py-4 rounded-2xl font-bold text-[16px] hover:bg-rose-50 transition-all active:scale-[.98]"
            >
              Cancel
            </button>
          )}

          {step === 'active' && (
            <div className="space-y-3">
              <button
                onClick={handleSendAlert}
                className="w-full bg-brick text-white py-4 rounded-2xl font-bold text-[16px] shadow-lift hover:shadow-lift-lg transition-all active:scale-[.98] flex items-center justify-center gap-2 animate-pulse"
              >
                <Send size={20} /> Send SOS Now
              </button>
              <button
                onClick={handleCancel}
                className="w-full bg-white border border-line text-ink-soft py-3.5 rounded-2xl font-semibold text-sm hover:bg-paper-card transition-colors"
              >
                Cancel & deactivate
              </button>
            </div>
          )}

          {/* Emergency contacts */}
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-ink-soft mb-3 font-mono uppercase tracking-wide text-center">
              Emergency Numbers
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {SOS_CONTACTS.map((contact) => (
                <a
                  key={contact.name}
                  href={`tel:${contact.number}`}
                  className="flex items-center gap-2.5 bg-white border border-line rounded-xl p-3.5 hover:shadow-card transition-all"
                >
                  <span className="text-xl">{contact.icon}</span>
                  <div>
                    <div className="text-xs font-semibold text-ink">{contact.name}</div>
                    <div className="text-[11px] font-mono text-ink-soft">{contact.number}</div>
                  </div>
                </a>
              ))}
            </div>

            <h3 className="text-xs font-semibold text-ink-soft mb-3 font-mono uppercase tracking-wide text-center">
              HelpJi Support
            </h3>
            <div className="space-y-2">
              {SUPPORT_CONTACTS.map((contact) => (
                <a
                  key={contact.name}
                  href={`tel:${contact.number.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-3 bg-white border border-line rounded-xl p-3.5 hover:shadow-card transition-all"
                >
                  <Shield size={20} className="text-marigold-deep" />
                  <div>
                    <div className="text-sm font-semibold text-ink">{contact.name}</div>
                    <div className="text-[11px] text-ink-soft">{contact.label} · {contact.number}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Safety tips */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-marigold-deep mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-ink mb-1">Safety Tips</h4>
                <ul className="text-[11px] text-ink-soft space-y-1 list-disc list-inside">
                  <li>Share your task details with a family member</li>
                  <li>Verify helper ID before allowing entry</li>
                  <li>Keep emergency contacts accessible</li>
                  <li>Use in-app chat instead of sharing personal number</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

