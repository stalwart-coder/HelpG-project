/**
 * TxnRow — HelpJi transaction row
 * Earnings in teal, withdrawals in muted, JetBrains Mono for amounts
 */
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function TxnRow({ title, date, amount }) {
  const positive = Number(amount) > 0;

  return (
    <div
      className="flex justify-between items-center py-3.5 px-3 -mx-3 rounded-xl
                 transition-colors cursor-default"
      style={{ borderBottom: '1px solid var(--hj-line)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hj-paper)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div className="flex items-center gap-3">
        {/* Direction icon */}
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
          style={{
            background: positive
              ? 'rgba(28,168,156,0.12)'
              : 'var(--hj-line)',
          }}
        >
          {positive
            ? <ArrowDownLeft size={15} style={{ color: '#1CA89C' }} />
            : <ArrowUpRight  size={15} style={{ color: 'var(--hj-ink-muted)' }} />
          }
        </div>

        {/* Info */}
        <div>
          <h4
            className="text-xs sm:text-sm font-semibold mb-0.5"
            style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--hj-ink)' }}
          >
            {title}
          </h4>
          <p
            className="text-[11px] m-0"
            style={{ color: 'var(--hj-ink-muted)', fontFamily: 'DM Sans, sans-serif' }}
          >
            {date}
          </p>
        </div>
      </div>

      {/* Amount */}
      <div
        className="text-sm font-bold shrink-0"
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          color: positive ? '#1CA89C' : 'var(--hj-ink-soft)',
        }}
      >
        {positive ? '+' : ''}₹{Math.abs(amount)}
      </div>
    </div>
  );
}
