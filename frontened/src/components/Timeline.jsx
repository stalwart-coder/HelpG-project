/**
 * Timeline — HelpJi Task Pulse Journey
 * Visual lifecycle indicator: NEED → MATCHING → CONFIRMED → ON THE WAY → WORKING → DONE
 * This is a signature HelpJi interaction pattern.
 */

const STEPS = [
  {
    id: 'open',
    label: 'Task Posted',
    sublabel: 'Looking for the right helper',
    icon: '📋',
    color: '#F4831F',     // saffron
    bgActive: 'rgba(244,131,31,0.12)',
  },
  {
    id: 'confirmed',
    label: 'Helper Matched',
    sublabel: 'Your helper accepted the task',
    icon: '🤝',
    color: '#1CA89C',     // teal
    bgActive: 'rgba(28,168,156,0.12)',
  },
  {
    id: 'progress',
    label: 'On the Way',
    sublabel: 'Helper is coming to you',
    icon: '🚀',
    color: '#1CA89C',
    bgActive: 'rgba(28,168,156,0.12)',
  },
  {
    id: 'working',
    label: 'Task Underway',
    sublabel: 'Helper is working on your task',
    icon: '⚡',
    color: '#F4831F',
    bgActive: 'rgba(244,131,31,0.15)',
  },
  {
    id: 'done',
    label: 'Completed',
    sublabel: 'Task done — rate your helper',
    icon: '✅',
    color: '#22A355',     // banyan green
    bgActive: 'rgba(34,163,85,0.12)',
  },
];

const STATUS_TO_STEP_IDX = {
  open:        0,
  pending:     0,
  confirmed:   1,
  on_the_way:  2,
  progress:    2,
  in_progress: 3,
  working:     3,
  done:        4,
  completed:   4,
};

export default function Timeline({ status = 'open' }) {
  const key = (status || 'open').toLowerCase().replace(/[\s-]/g, '_');
  const activeIdx = STATUS_TO_STEP_IDX[key] ?? 0;

  return (
    <div className="space-y-0 relative">
      {/* Vertical connector line */}
      <div
        className="absolute left-[18px] top-6 bottom-6 w-0.5 dark:bg-[#3D2D1E]"
        style={{ backgroundColor: 'var(--hj-line)' }}
      />

      {STEPS.map((step, idx) => {
        const isDone    = idx < activeIdx;
        const isActive  = idx === activeIdx;
        const isFuture  = idx > activeIdx;

        return (
          <div key={step.id} className="relative flex items-start gap-3.5 py-3">
            {/* Step node */}
            <div className="relative z-10 shrink-0">
              {isDone ? (
                // Completed node
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm"
                  style={{ background: step.color, boxShadow: `0 0 0 4px ${step.bgActive}` }}
                >
                  ✓
                </div>
              ) : isActive ? (
                // Active node — pulsing
                <div className="relative">
                  <div
                    className="animate-ping absolute inset-0 rounded-full opacity-30"
                    style={{ background: step.color }}
                  />
                  <div
                    className="relative w-9 h-9 rounded-full flex items-center justify-center text-base"
                    style={{
                      background: step.bgActive,
                      border: `2px solid ${step.color}`,
                      boxShadow: `0 0 0 4px ${step.bgActive}`,
                    }}
                  >
                    {step.icon}
                  </div>
                </div>
              ) : (
                // Future node — muted
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                  style={{
                    background: 'var(--hj-line)',
                    color: 'var(--hj-ink-muted)',
                  }}
                >
                  {idx + 1}
                </div>
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 pt-1.5 min-w-0">
              <div
                className="text-sm font-semibold leading-tight"
                style={{
                  fontFamily: 'Sora, sans-serif',
                  color: isActive
                    ? step.color
                    : isDone
                    ? 'var(--hj-ink)'
                    : 'var(--hj-ink-muted)',
                }}
              >
                {step.label}
                {isActive && (
                  <span
                    className="ml-2 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      background: step.bgActive,
                      color: step.color,
                    }}
                  >
                    Now
                  </span>
                )}
              </div>
              {(isActive || isDone) && (
                <div
                  className="text-[12px] mt-0.5"
                  style={{ color: 'var(--hj-ink-muted)' }}
                >
                  {step.sublabel}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
