/**
 * Landing Hero — HelpJi
 * Editorial storytelling composition — NOT a SaaS template
 * Warm paper background · Saffron + Teal · Sora display font
 * Human connection, local help, speed, trust
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import { matchServiceFromQuery } from '../../utils/search';
import HeroScene3D from '../3d/HeroScene3D';
import TiltCard3D from '../3d/TiltCard3D';

const QUICK_SERVICES = [
  { emoji: '👕', label: 'Iron clothes', id: 'iron',      price: 'from ₹199' },
  { emoji: '🧹', label: 'Deep clean',   id: 'cleaning',  price: 'from ₹499' },
  { emoji: '🚗', label: 'Car wash',     id: 'vehicle',   price: 'from ₹299' },
  { emoji: '🛍️', label: 'Errands',     id: 'groceries', price: 'from ₹99'  },
];

const SERVICE_CARDS = [
  { emoji: '👕', service: 'Steam Ironing',  tagline: '12 verified helpers near you', badge: '15 min',    id: 'iron',      tall: false },
  { emoji: '🧹', service: 'Deep Cleaning',  tagline: 'Top-rated in Bengaluru',       badge: '4.9 ★',    id: 'cleaning',  tall: true  },
  { emoji: '🚗', service: 'Car Detailing',  tagline: 'Waterless eco-wash, doorstep', badge: 'Doorstep', id: 'vehicle',   tall: true  },
  { emoji: '💊', service: 'Pharmacy Run',   tagline: 'Instant pickup & drop',        badge: '20 min',   id: 'groceries', tall: false },
];

function ServiceCard({ emoji, service, tagline, badge, tall, id, onSelect }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -3, scale: 1.02 }}
      onClick={() => onSelect?.(id)}
      className={`w-full text-left flex flex-col justify-between rounded-[16px] p-4
                  transition-all cursor-pointer focus:outline-none
                  ${tall ? 'h-48' : 'h-36'}`}
      style={{
        background: 'var(--hj-paper-card)',
        border: '1px solid var(--hj-line)',
        boxShadow: 'var(--hj-shadow-card)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="text-3xl">{emoji}</div>
        <span
          className="px-2 py-0.5 rounded-[5px] text-[10px] font-bold"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            background: 'rgba(244,131,31,0.10)',
            color: '#E06A08',
          }}
        >
          {badge}
        </span>
      </div>
      <div>
        <div
          className="font-bold text-sm mb-1 leading-snug"
          style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}
        >
          {service}
        </div>
        <div className="text-[11px] flex items-center gap-1" style={{ color: 'var(--hj-ink-muted)' }}>
          <MapPin size={10} style={{ color: '#1CA89C' }} /> {tagline}
        </div>
      </div>
    </motion.button>
  );
}

export default function Hero({ onGetStarted, onBecomeHelper, onSelectService }) {
  const [query, setQuery]       = useState('');
  const [searching, setSearching] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const handleSearch = () => {
    if (searching) return;
    setSearching(true);
    const serviceId = matchServiceFromQuery(query);
    setTimeout(() => {
      setSearching(false);
      serviceId ? onSelectService?.(serviceId) : onGetStarted?.();
    }, 300);
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'var(--hj-paper)' }}
    >
      {/* Warm tonal backgrounds — not harsh gradients */}
      <div
        className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(244,131,31,0.08) 0%, transparent 70%)',
          transform: 'translate(30%, -30%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(28,168,156,0.07) 0%, transparent 70%)',
          transform: 'translate(-30%, 30%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-5 lg:px-10 pt-14 pb-20 relative">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* ── Left: Story + Action ── */}
          <div className="lg:col-span-7">

            {/* Live network badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
              style={{
                background: 'var(--hj-paper-card)',
                border: '1px solid var(--hj-line)',
                boxShadow: 'var(--hj-shadow-xs)',
              }}
            >
              {/* Live dot */}
              <span className="relative inline-flex" style={{ width: 8, height: 8 }}>
                <span
                  className="animate-ping absolute inset-0 rounded-full opacity-50"
                  style={{ background: '#22C55E' }}
                />
                <span className="relative inline-flex rounded-full h-full w-full" style={{ background: '#22C55E' }} />
              </span>
              <span
                className="text-xs font-semibold"
                style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--hj-ink-soft)' }}
              >
                Verified Hyperlocal Network · Bengaluru &amp; Expanding
              </span>
            </motion.div>

            {/* Headline — editorial, not SaaS */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="font-extrabold tracking-tight mb-5"
              style={{
                fontFamily: 'Sora, sans-serif',
                fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
                lineHeight: 1.08,
                color: 'var(--hj-ink)',
                letterSpacing: '-0.03em',
              }}
            >
              Everyday chores,<br />
              done by{' '}
              <span style={{ color: '#F4831F' }}>trusted neighbors.</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.10 }}
              className="text-base sm:text-lg leading-relaxed mb-8 max-w-xl"
              style={{ color: 'var(--hj-ink-soft)', fontFamily: 'DM Sans, sans-serif' }}
            >
              Need ironing, cleaning, a car wash, or a quick errand run?
              Post in 30 seconds and get matched with background-verified helpers right in your neighbourhood.
            </motion.p>

            {/* Smart search */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="flex items-center gap-2 p-2 rounded-[14px] mb-4 max-w-xl transition-all"
              style={{
                background: 'var(--hj-paper-card)',
                border: inputFocused
                  ? '1.5px solid #F4831F'
                  : '1.5px solid var(--hj-line)',
                boxShadow: inputFocused
                  ? '0 0 0 4px rgba(244,131,31,0.10), var(--hj-shadow-card)'
                  : 'var(--hj-shadow-card)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              <div className="flex items-center gap-2.5 flex-1 px-3">
                <Sparkles size={17} style={{ color: '#F4831F', flexShrink: 0 }} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder="What task do you need done today?"
                  className="w-full py-3 text-sm bg-transparent outline-none"
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    color: 'var(--hj-ink)',
                  }}
                  disabled={searching}
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="flex items-center gap-1.5 px-5 py-3 rounded-[10px] font-bold text-sm
                           text-white active:scale-95 transition-all shrink-0"
                style={{
                  fontFamily: 'Sora, sans-serif',
                  background: '#F4831F',
                  boxShadow: '0 4px 12px rgba(244,131,31,0.25)',
                }}
              >
                {searching ? 'Finding…' : <><span>Find Help</span> <ArrowRight size={14} /></>}
              </button>
            </motion.div>

            {/* Quick chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="flex flex-wrap gap-2 mb-10"
            >
              {QUICK_SERVICES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectService?.(s.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px]
                             text-[12px] font-medium active:scale-95 transition-all"
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    background: 'var(--hj-line)',
                    color: 'var(--hj-ink-soft)',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(244,131,31,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(244,131,31,0.3)';
                    e.currentTarget.style.color = '#E06A08';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--hj-line)';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = 'var(--hj-ink-soft)';
                  }}
                >
                  {s.emoji} {s.label}
                  <span style={{ color: 'var(--hj-ink-muted)', fontSize: '11px' }}>{s.price}</span>
                </button>
              ))}
            </motion.div>

            {/* Stats ticker */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="grid grid-cols-3 gap-6 pt-6 max-w-lg"
              style={{ borderTop: '1px solid var(--hj-line)' }}
            >
              {[
                { val: 4820, suffix: '+',  label: 'Tasks Completed', color: '#F4831F' },
                { val: 4.9,  suffix: ' ★', label: 'Verified Rating',  color: '#F4831F' },
                { val: 14,   suffix: 'm',  label: 'Avg Match Time',   color: '#1CA89C' },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    className="font-extrabold"
                    style={{
                      fontFamily: 'Sora, sans-serif',
                      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                      color: s.color,
                      lineHeight: 1,
                    }}
                  >
                    <AnimatedCounter value={s.val} />{s.suffix}
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: 'var(--hj-ink-muted)', fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Service mosaic ── */}
          {/* ── Right: 3D Holographic Globe & Floating Cards ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.15 }}
            className="lg:col-span-5 relative hidden lg:block"
          >
            {/* Real Three.js 3D Holographic Mesh */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900/5 via-amber-500/5 to-teal-500/5 p-2 border border-slate-200/80 dark:border-slate-800 shadow-xl">
              <HeroScene3D onSelectService={onSelectService} />

              {/* Floating 3D Tilt Card 1: Top Left */}
              <div className="absolute top-4 left-4 z-20 w-48">
                <TiltCard3D maxTilt={18} scale={1.05} onClick={() => onSelectService?.('iron')}>
                  <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-line shadow-card">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">👕</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600">
                        15 min
                      </span>
                    </div>
                    <div className="font-bold text-xs text-ink">Steam Ironing</div>
                    <div className="text-[10px] text-ink-muted">12 verified helpers nearby</div>
                  </div>
                </TiltCard3D>
              </div>

              {/* Floating 3D Tilt Card 2: Bottom Right */}
              <div className="absolute bottom-12 right-4 z-20 w-52">
                <TiltCard3D maxTilt={18} scale={1.05} onClick={() => onSelectService?.('vehicle')}>
                  <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-line shadow-card">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">🚗</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/10 text-teal-600">
                        Doorstep
                      </span>
                    </div>
                    <div className="font-bold text-xs text-ink">Eco Car Wash</div>
                    <div className="text-[10px] text-ink-muted">Waterless doorstep care</div>
                  </div>
                </TiltCard3D>
              </div>

              {/* Floating 3D Trust Card: Middle Left */}
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-56">
                <TiltCard3D maxTilt={12} scale={1.04}>
                  <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-line shadow-float">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-ink">100% Aadhaar Verified</div>
                        <div className="text-[10px] text-ink-muted">Instant Background Check</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[11px] pt-2 border-t border-line">
                      <span className="text-ink-muted">Live nearby</span>
                      <span className="font-bold font-mono text-amber-600">38 helpers</span>
                    </div>
                  </div>
                </TiltCard3D>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
