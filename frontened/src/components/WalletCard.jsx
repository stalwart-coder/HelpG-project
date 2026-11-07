/**
 * WalletCard — HelpJi Earnings Balance Card
 * Deep ink background · Teal accent (helper role)
 * Clean financial display without excessive decoration
 */
import { Wallet, ArrowUpRight, Download, TrendingUp } from 'lucide-react';

export default function WalletCard({ label, amount, primaryLabel, secondaryLabel, onPrimary, onSecondary }) {
  return (
    <div
      className="relative rounded-2xl p-6 mb-6 overflow-hidden"
      style={{
        background: 'var(--hj-ink)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 8px 32px rgba(26,26,46,0.20)',
      }}
    >
      {/* Subtle teal glow — helper identity */}
      <div
        className="absolute -right-8 -top-8 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: 'rgba(28,168,156,0.12)', filter: 'blur(24px)' }}
      />
      <div
        className="absolute -left-4 -bottom-4 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: 'rgba(244,131,31,0.08)', filter: 'blur(20px)' }}
      />

      {/* Header row */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center"
            style={{ background: 'rgba(28,168,156,0.18)' }}
          >
            <Wallet size={16} style={{ color: '#1CA89C' }} />
          </div>
          <span
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.45)' }}
          >
            {label}
          </span>
        </div>

        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-bold"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            background: 'rgba(34,163,85,0.18)',
            color: '#4ade80',
          }}
        >
          <TrendingUp size={10} />
          Instant UPI
        </span>
      </div>

      {/* Balance */}
      <div
        className="relative text-white mb-5"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 'clamp(2rem, 8vw, 2.75rem)',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          lineHeight: 1,
        }}
      >
        <span style={{ fontSize: '0.5em', opacity: 0.55, verticalAlign: 'super' }}>₹</span>
        {amount}
      </div>

      {/* Actions */}
      <div className="relative flex gap-3">
        <button
          type="button"
          onClick={onPrimary}
          disabled={!onPrimary}
          className="flex-1 py-3 rounded-xl font-bold text-xs
                     flex items-center justify-center gap-1.5
                     active:scale-[0.97] transition-all disabled:opacity-50"
          style={{
            fontFamily: 'Sora, sans-serif',
            background: '#1CA89C',
            color: 'white',
            boxShadow: '0 4px 12px rgba(28,168,156,0.25)',
          }}
        >
          <ArrowUpRight size={14} />
          {primaryLabel}
        </button>

        <button
          type="button"
          onClick={onSecondary}
          disabled={!onSecondary}
          className="flex-1 py-3 rounded-xl font-bold text-xs
                     flex items-center justify-center gap-1.5
                     active:scale-[0.97] transition-all disabled:opacity-50"
          style={{
            fontFamily: 'Sora, sans-serif',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.70)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <Download size={14} />
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}
