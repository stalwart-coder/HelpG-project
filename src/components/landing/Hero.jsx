import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, ShieldCheck, Clock, Star } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import { matchServiceFromQuery } from '../../utils/search';

const QUICK_SERVICES = [
  { label: 'Ironing & Wash', id: 'iron' },
  { label: 'Vehicle Wash', id: 'vehicle' },
  { label: 'Temp Guard', id: 'guard' },
  { label: 'Event Staff', id: 'event' },
];

const HERO_CARDS = [
  { emoji: '👕', label: 'Ironing & Wash', sub: '6 tasks near you', serviceId: 'iron' },
  { emoji: '🛡️', label: 'Temporary Guard', sub: 'Available today', tall: true, serviceId: 'guard' },
  { emoji: '🍽️', label: 'Event Staff', sub: 'Book for weekend', tall: true, serviceId: 'event' },
  { emoji: '🚗', label: 'Vehicle Wash', sub: '₹220 avg', serviceId: 'vehicle' },
];

export default function Hero({ onGetStarted, onSelectService }) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if (searching) return;
    setSearching(true);
    const serviceId = matchServiceFromQuery(query);
    setTimeout(() => {
      setSearching(false);
      if (serviceId) {
        onSelectService?.(serviceId);
      } else {
        onGetStarted?.();
      }
    }, 300);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F4F0E6] via-paper to-paper">
      <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-marigold/10 blur-3xl" />
      <div className="absolute top-40 -left-40 w-[400px] h-[400px] rounded-full bg-banyan/10 blur-3xl" />

      <div className="max-w-7xl mx-auto px-5 lg:px-10 pt-14 pb-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white border border-line rounded-full px-4 py-1.5 text-xs font-semibold text-ink-soft mb-6 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-banyan animate-pulse" />
              Now live in Jaipur · Expanding soon
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="font-display text-[40px] sm:text-[52px] leading-[1.08] font-bold text-ink tracking-tight mb-5"
            >
              Everyday help,
              <br />
              <span className="text-marigold-deep">trusted &amp; nearby.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="text-ink-soft text-[16.5px] leading-relaxed mb-8 max-w-md"
            >
              Ironing, vehicle wash, temporary guards, and event staff — verified local helpers,
              matched in minutes. No calls, no contacts, no guesswork.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="bg-white rounded-2xl shadow-lift border border-line p-2 flex items-center gap-2 mb-3 max-w-lg"
            >
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search size={18} className="text-ink-soft shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="What do you need help with?"
                  className="w-full py-3 text-[14.5px] outline-none placeholder:text-ink-soft/60"
                  disabled={searching}
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="bg-marigold text-ink font-semibold text-[14px] px-5 py-3 rounded-xl hover:bg-marigold-deep hover:text-white transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-60"
              >
                {searching ? 'Searching…' : <>Find help <ArrowRight size={15} /></>}
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap gap-x-6 gap-y-2 mb-10"
            >
              {QUICK_SERVICES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectService?.(s.id)}
                  className="text-[13px] font-medium text-ink-soft hover:text-marigold-deep transition-colors underline decoration-line underline-offset-4"
                >
                  {s.label}
                </button>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="grid grid-cols-3 gap-6 max-w-md"
            >
              <div>
                <div className="font-display text-2xl font-bold text-ink">
                  <AnimatedCounter value={2340} />+
                </div>
                <div className="text-xs text-ink-soft mt-0.5">Tasks completed</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-ink">
                  <AnimatedCounter value={4.7} />★
                </div>
                <div className="text-xs text-ink-soft mt-0.5">Average rating</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-ink">
                  <AnimatedCounter value={18} />m
                </div>
                <div className="text-xs text-ink-soft mt-0.5">Avg match time</div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-10">
                <HeroImgCard {...HERO_CARDS[0]} onSelect={onSelectService} />
                <HeroImgCard {...HERO_CARDS[1]} onSelect={onSelectService} />
              </div>
              <div className="space-y-4">
                <HeroImgCard {...HERO_CARDS[2]} onSelect={onSelectService} />
                <HeroImgCard {...HERO_CARDS[3]} onSelect={onSelectService} />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-lift border border-line p-4 w-52"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck size={16} className="text-banyan" />
                <span className="text-xs font-semibold">ID Verified Helper</span>
              </div>
              <div className="flex items-center gap-1 text-marigold-deep text-xs">
                <Star size={12} fill="currentColor" /> 4.8 · 212 tasks done
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroImgCard({ emoji, label, sub, tall, serviceId, onSelect }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4 }}
      onClick={() => onSelect?.(serviceId)}
      className={`bg-white rounded-2xl border border-line shadow-card p-5 flex flex-col justify-between text-left w-full hover:shadow-lift transition-shadow ${
        tall ? 'h-44' : 'h-32'
      }`}
    >
      <div className="text-3xl">{emoji}</div>
      <div>
        <div className="font-semibold text-sm text-ink">{label}</div>
        <div className="text-xs text-ink-soft mt-0.5 flex items-center gap-1">
          <Clock size={11} /> {sub}
        </div>
      </div>
    </motion.button>
  );
}
