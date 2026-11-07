/**
 * RoleSelection — HelpJi
 * Emotional differentiation between customer and helper roles.
 * Customer: Saffron warmth — "I need help"
 * Helper: Teal confidence — "I want to earn"
 */
import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertTriangle, ChevronLeft, ArrowRight } from 'lucide-react';

const ROLES = [
  {
    id: 'customer',
    emoji: '🙋',
    headline: 'I need help',
    subline: 'Post tasks and get things done',
    description: 'Book verified local helpers for ironing, cleaning, errands, car wash, and more. Done in minutes.',
    tags: ['Post tasks', 'Track live', 'Pay securely'],
    accent: '#F4831F',
    accentLight: 'rgba(244,131,31,0.08)',
    accentBorder: 'rgba(244,131,31,0.35)',
  },
  {
    id: 'helper',
    emoji: '🛠️',
    headline: 'I want to earn',
    subline: 'Find tasks, work near you, get paid',
    description: 'Accept tasks nearby, work on your own schedule, and withdraw earnings directly to your bank or UPI.',
    tags: ['Set your hours', 'Nearby tasks', 'Instant UPI payout'],
    accent: '#1CA89C',
    accentLight: 'rgba(28,168,156,0.08)',
    accentBorder: 'rgba(28,168,156,0.35)',
  },
];

export default function RoleSelection({ onNavigate }) {
  const { t } = useLanguage();
  const { authLoading, authError, clearError } = useAuth();

  const [selected, setSelected] = useState(null);
  const [step, setStep]         = useState('select');

  const handleContinue = async () => {
    if (!selected || authLoading) return;
    setStep('success');
    setTimeout(() => onNavigate?.('app', selected), 1200);
  };

  if (step === 'success') {
    const role = ROLES.find((r) => r.id === selected);
    return (
      <div
        className="min-h-screen flex items-center justify-center px-5 py-10"
        style={{ background: 'var(--hj-paper)' }}
      >
        <div className="w-full max-w-[440px] text-center animate-fade-in-up">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-4xl"
            style={{ background: role?.accentLight }}
          >
            {role?.emoji}
          </div>
          <h1
            className="font-extrabold tracking-tight mb-2"
            style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: '1.625rem',
              color: 'var(--hj-ink)',
              letterSpacing: '-0.03em',
            }}
          >
            {selected === 'customer' ? 'Ready to find help!' : 'Ready to start earning!'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--hj-ink-soft)', fontFamily: 'DM Sans, sans-serif' }}>
            Setting up your experience…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-10"
      style={{ background: 'var(--hj-paper)' }}
    >
      <div className="w-full max-w-[480px]">
        {/* Back */}
        <button
          type="button"
          onClick={() => onNavigate?.('landing')}
          className="flex items-center gap-1.5 text-sm font-medium mb-8 transition-colors focus:outline-none"
          style={{ color: 'var(--hj-ink-muted)', fontFamily: 'DM Sans, sans-serif' }}
        >
          <ChevronLeft size={16} /> Back to home
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center font-extrabold text-lg text-white"
              style={{ background: 'var(--hj-ink)', fontFamily: 'Sora, sans-serif' }}
            >
              H
            </div>
            <span
              className="font-extrabold text-xl"
              style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)', letterSpacing: '-0.03em' }}
            >
              HelpJi
            </span>
          </div>
          <h1
            className="font-extrabold tracking-tight mb-2"
            style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: '1.625rem',
              color: 'var(--hj-ink)',
              letterSpacing: '-0.03em',
            }}
          >
            How would you like to use HelpJi?
          </h1>
          <p
            className="text-sm max-w-xs mx-auto"
            style={{ color: 'var(--hj-ink-soft)', fontFamily: 'DM Sans, sans-serif' }}
          >
            Choose your role to personalise your experience.
          </p>
        </div>

        {/* Role cards — side by side, visually distinct */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          {ROLES.map((role) => {
            const isSelected = selected === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => { setSelected(role.id); if (authError) clearError(); }}
                disabled={authLoading}
                className="relative text-left p-6 rounded-2xl transition-all duration-250
                           active:scale-[0.99] focus:outline-none disabled:opacity-50"
                style={{
                  background: isSelected ? role.accentLight : 'var(--hj-paper-card)',
                  border: isSelected ? `2px solid ${role.accentBorder}` : '2px solid var(--hj-line)',
                  boxShadow: isSelected
                    ? `0 8px 24px ${role.accentLight}`
                    : 'var(--hj-shadow-card)',
                }}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div
                    className="absolute top-5 right-5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: role.accent }}
                  >
                    ✓
                  </div>
                )}

                {/* Emoji */}
                <div className="text-4xl mb-3">{role.emoji}</div>

                {/* Headline */}
                <h3
                  className="font-bold mb-0.5"
                  style={{
                    fontFamily: 'Sora, sans-serif',
                    fontSize: '1.125rem',
                    color: 'var(--hj-ink)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {role.headline}
                </h3>

                {/* Subline */}
                <p
                  className="text-[12px] font-semibold mb-2"
                  style={{ color: role.accent, fontFamily: 'DM Sans, sans-serif' }}
                >
                  {role.subline}
                </p>

                {/* Description */}
                <p
                  className="text-[13px] leading-relaxed mb-4"
                  style={{ color: 'var(--hj-ink-soft)', fontFamily: 'DM Sans, sans-serif' }}
                >
                  {role.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {role.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2.5 py-1 rounded-[6px] font-medium"
                      style={{
                        fontFamily: 'DM Sans, sans-serif',
                        background: isSelected ? `${role.accent}15` : 'var(--hj-line)',
                        color: isSelected ? role.accent : 'var(--hj-ink-soft)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {authError && (
          <div
            className="flex items-center gap-2 text-sm rounded-xl px-4 py-3 mb-5 animate-fade-in"
            style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#EF4444',
            }}
          >
            <AlertTriangle size={15} className="shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Continue */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected || authLoading}
          className="w-full font-bold text-[15px] py-4 rounded-xl text-white
                     flex items-center justify-center gap-2
                     active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            fontFamily: 'Sora, sans-serif',
            background: selected
              ? (ROLES.find((r) => r.id === selected)?.accent || 'var(--hj-ink)')
              : 'var(--hj-ink)',
            boxShadow: selected ? `0 4px 16px ${ROLES.find((r) => r.id === selected)?.accentLight}` : 'none',
            transition: 'background 0.3s ease',
          }}
        >
          {authLoading ? (
            <><Loader2 size={18} className="animate-spin" /> Setting up…</>
          ) : selected ? (
            <>
              {selected === 'customer' ? 'Continue as customer' : 'Continue as helper'}
              <ArrowRight size={16} />
            </>
          ) : (
            'Select a role to continue'
          )}
        </button>

        <p
          className="text-center text-[12.5px] mt-5"
          style={{ color: 'var(--hj-ink-muted)', fontFamily: 'DM Sans, sans-serif' }}
        >
          You can switch roles later from settings.
        </p>
      </div>
    </div>
  );
}
