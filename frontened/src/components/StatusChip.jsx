/**
 * StatusChip — HelpJi task state indicator
 * Shows task status with appropriate color + icon + optional pulse dot
 */
import { CheckCircle2, Clock, Loader2, AlertCircle, XCircle, X } from 'lucide-react';

const STATUS_CONFIG = {
  open: {
    label: 'Open',
    bg: 'bg-[#FFF5EA] dark:bg-[rgba(244,131,31,0.12)]',
    text: 'text-[#E06A08] dark:text-[#FFA033]',
    dot: '#F4831F',
    icon: Clock,
    pulse: false,
  },
  pending: {
    label: 'Matching',
    bg: 'bg-[#FFF5EA] dark:bg-[rgba(244,131,31,0.12)]',
    text: 'text-[#E06A08] dark:text-[#FFA033]',
    dot: '#F4831F',
    icon: Loader2,
    pulse: true,
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-[#E6F9F7] dark:bg-[rgba(28,168,156,0.12)]',
    text: 'text-[#157F75] dark:text-[#2ABCAE]',
    dot: '#1CA89C',
    icon: CheckCircle2,
    pulse: false,
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-[#E6F9F7] dark:bg-[rgba(28,168,156,0.15)]',
    text: 'text-[#157F75] dark:text-[#4ACFC0]',
    dot: '#1CA89C',
    icon: Loader2,
    pulse: true,
  },
  completed: {
    label: 'Done',
    bg: 'bg-[#F0FDF4] dark:bg-[rgba(34,163,85,0.12)]',
    text: 'text-[#16803a] dark:text-[#4ade80]',
    dot: '#22A355',
    icon: CheckCircle2,
    pulse: false,
  },
  done: {
    label: 'Done',
    bg: 'bg-[#F0FDF4] dark:bg-[rgba(34,163,85,0.12)]',
    text: 'text-[#16803a] dark:text-[#4ade80]',
    dot: '#22A355',
    icon: CheckCircle2,
    pulse: false,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-[#FFF1F2] dark:bg-[rgba(239,68,68,0.12)]',
    text: 'text-[#dc2626] dark:text-[#f87171]',
    dot: '#EF4444',
    icon: XCircle,
    pulse: false,
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-[#FFF1F2] dark:bg-[rgba(239,68,68,0.12)]',
    text: 'text-[#dc2626] dark:text-[#f87171]',
    dot: '#EF4444',
    icon: X,
    pulse: false,
  },
};

export default function StatusChip({ status, size = 'md' }) {
  const key = (status || 'open').toLowerCase().replace(/[\s-]/g, '_');
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.open;
  const Icon = cfg.icon;

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-1',
    md: 'px-2 py-0.5 text-[10.5px] gap-1',
    lg: 'px-2.5 py-1 text-xs gap-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center font-mono font-semibold uppercase tracking-wider
        rounded-[6px] leading-none select-none
        ${cfg.bg} ${cfg.text} ${sizes[size] || sizes.md}
      `}
    >
      {cfg.pulse ? (
        <span
          className="relative inline-flex shrink-0"
          style={{ width: size === 'lg' ? 7 : 6, height: size === 'lg' ? 7 : 6 }}
        >
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ backgroundColor: cfg.dot }}
          />
          <span
            className="relative inline-flex rounded-full h-full w-full"
            style={{ backgroundColor: cfg.dot }}
          />
        </span>
      ) : (
        <Icon
          size={size === 'lg' ? 11 : 10}
          className="shrink-0"
          style={cfg.pulse ? undefined : { animationDuration: '2s' }}
        />
      )}
      {cfg.label}
    </span>
  );
}
