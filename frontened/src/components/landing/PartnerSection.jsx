import { motion } from 'framer-motion';
import { ArrowRight, Users, Heart, TrendingUp } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';

export function PartnerSection({ onBecomeHelper }) {
  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-10 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-marigold to-marigold-deep p-10 sm:p-14 grid lg:grid-cols-2 gap-8 items-center"
      >
        <div className="absolute -bottom-20 -right-10 w-72 h-72 rounded-full bg-white/10" />
        <div className="relative">
          <span className="text-xs font-mono uppercase tracking-wide text-ink/70 font-semibold">
            For helpers
          </span>
          <h2 className="font-display text-[30px] font-bold text-ink mt-2 mb-4 leading-tight">
            Earn on your own schedule, near your own home.
          </h2>
          <p className="text-ink/80 text-[14.5px] mb-7 max-w-md">
            Set your skills and availability, get matched with nearby tasks, and get paid directly
            to your wallet — same day.
          </p>
          <button
            onClick={onBecomeHelper}
            className="bg-ink text-white font-semibold text-sm px-6 py-3.5 rounded-full inline-flex items-center gap-2 hover:shadow-lift transition-all active:scale-[.97]"
          >
            Become a Helper <ArrowRight size={16} />
          </button>
        </div>
        <div className="relative grid grid-cols-2 gap-4">
          <StatCard icon={Users} value={340} suffix="+" label="Active helpers" />
          <StatCard icon={TrendingUp} value={3200} suffix="" label="Avg monthly earning ₹" />
        </div>
      </motion.div>
    </section>
  );
}

function StatCard({ icon: Icon, value, suffix, label }) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl p-5">
      <Icon size={20} className="text-marigold-deep mb-2" />
      <div className="font-display text-2xl font-bold text-ink">
        <AnimatedCounter value={value} suffix={suffix} />
      </div>
      <div className="text-xs text-ink-soft mt-0.5">{label}</div>
    </div>
  );
}

export function CommunityImpact() {
  const stats = [
    { icon: Users, value: 340, suffix: '+', label: 'Local jobs created' },
    { icon: Heart, value: 46, suffix: '%', label: 'Women helpers' },
    { icon: TrendingUp, value: 2340, suffix: '+', label: 'Tasks completed' },
  ];
  return (
    <section className="bg-paper-card border-y border-line py-16">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="text-center mb-10 max-w-lg mx-auto">
          <span className="text-xs font-mono uppercase tracking-wide text-marigold-deep font-semibold">
            Community impact
          </span>
          <h2 className="font-display text-[26px] font-bold text-ink mt-1.5">
            More than an app — a local economy.
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="w-12 h-12 rounded-full bg-marigold/15 flex items-center justify-center mx-auto mb-3">
                <s.icon size={20} className="text-marigold-deep" />
              </div>
              <div className="font-display text-2xl font-bold text-ink">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-xs text-ink-soft mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
