/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // ── HelpJi Color System ───────────────────────────────────────────
      colors: {
        // Primary brand: Saffron (customer focus)
        saffron: {
          50:  '#FFF5EA',
          100: '#FFE8CC',
          200: '#FFD099',
          300: '#FFB866',
          400: '#FFA033',
          500: '#F4831F',  // HelpJi primary
          600: '#E06A08',
          700: '#B85200',
          800: '#903F00',
          900: '#6B2E00',
          DEFAULT: '#F4831F',
          light: '#FFF0E0',
          glow: 'rgba(244,131,31,0.25)',
        },
        // Secondary brand: Teal (helper focus, trust, verified states)
        teal: {
          50:  '#E6F9F7',
          100: '#C0F0EA',
          200: '#85E0D5',
          300: '#4ACFC0',
          400: '#2ABCAE',
          500: '#1CA89C',  // HelpJi helper accent
          600: '#157F75',
          700: '#0F5A52',
          800: '#093D38',
          900: '#04201D',
          DEFAULT: '#1CA89C',
          light: '#E0F7F5',
          glow: 'rgba(28,168,156,0.25)',
        },
        // Ink: primary text (maps cleanly to theme variables)
        ink: {
          DEFAULT: 'var(--hj-ink)',
          soft:    'var(--hj-ink-soft)',
          muted:   'var(--hj-ink-muted)',
          faint:   'var(--hj-ink-faint)',
        },
        // Paper: surfaces & cards (maps cleanly to theme variables)
        paper: {
          DEFAULT:      'var(--hj-paper)',
          card:         'var(--hj-paper-card)',
          warm:         'var(--hj-paper-warm)',
          dark:         '#0F0E17',
          darkCard:     '#1A1A2E',
          darkElevated: '#24243B',
        },
        // Line: borders (maps cleanly to theme variables)
        line: {
          DEFAULT:    'var(--hj-line)',
          strong:     'var(--hj-line-strong)',
          dark:       '#2A2A40',
          darkStrong: '#3E3E5C',
        },
        // Semantic / Status colors
        banyan: '#22A355',    // success, verified
        alert: '#EF4444',     // error, cancel
        caution: '#F59E0B',   // warning
        sky: '#3B82F6',       // info
        pulse: '#22C55E',     // live / active pulse

        // Legacy compatibility aliases (used in existing components)
        marigold: {
          DEFAULT: '#F4831F',
          deep: '#E06A08',
          light: '#FFF0E0',
        },
        brand: {
          DEFAULT: '#F4831F',
          deep: '#E06A08',
          glow: '#FFD099',
        },
        success: '#22A355',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },

      // ── HelpJi Typography ─────────────────────────────────────────────
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],         // Headlines, brand
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],      // Body, UI text
        mono:    ['"JetBrains Mono"', 'monospace'],             // Numbers, codes, data
        // Legacy aliases
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },

      // ── HelpJi Shadow System ──────────────────────────────────────────
      boxShadow: {
        // Core shadows (warm-tinted, not harsh black)
        xs:            '0 1px 3px rgba(26,26,46,0.05)',
        card:          '0 2px 8px rgba(26,26,46,0.06), 0 1px 2px rgba(26,26,46,0.04)',
        'card-hover':  '0 8px 24px rgba(26,26,46,0.10), 0 2px 6px rgba(26,26,46,0.05)',
        raised:        '0 6px 20px rgba(26,26,46,0.10)',
        float:         '0 12px 40px rgba(26,26,46,0.14)',
        lift:          '0 20px 40px -8px rgba(244,131,31,0.20)',
        // Saffron glow (customer)
        saffron:       '0 0 20px rgba(244,131,31,0.30)',
        'saffron-lg':  '0 0 40px rgba(244,131,31,0.20)',
        // Teal glow (helper)
        teal:          '0 0 20px rgba(28,168,156,0.30)',
        'teal-lg':     '0 0 40px rgba(28,168,156,0.20)',
        // Dark mode shadows
        'dark-card':   '0 4px 20px rgba(0,0,0,0.40)',
        'dark-hover':  '0 12px 32px rgba(0,0,0,0.60)',
        // Legacy
        glow:          '0 0 24px rgba(244,131,31,0.35)',
        'glow-cyan':   '0 0 24px rgba(28,168,156,0.40)',
        soft:          '0 2px 8px rgba(26,26,46,0.05)',
      },

      // ── HelpJi Border Radius ──────────────────────────────────────────
      borderRadius: {
        card:  '16px',    // Standard cards
        modal: '20px',    // Modals / bottom sheets
        btn:   '12px',    // Buttons
        chip:  '6px',     // Category chips
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },

      // ── HelpJi Animations ─────────────────────────────────────────────
      animation: {
        // Entrances
        'fade-in':      'fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-up':   'fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-down': 'fade-in-down 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':     'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up':     'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',

        // Task Pulse ring animations
        'pulse-ring':   'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-breath': 'pulse-breath 3s ease-in-out infinite',
        'spin-slow':    'spin 3s linear infinite',

        // Radar / distance
        'radar-ping':   'radar-ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite',
        'radar-sweep':  'radar-sweep 4s linear infinite',

        // Loading states
        'skeleton-shimmer': 'skeleton-shimmer 1.6s ease-in-out infinite',
        'pulse-subtle':     'pulse-subtle 2.5s ease-in-out infinite',
      },

      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%':       { transform: 'scale(1)',   opacity: '0.8' },
          '50%':      { transform: 'scale(1.08)', opacity: '0.4' },
          '100%':     { transform: 'scale(1)',   opacity: '0.8' },
        },
        'pulse-breath': {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.03)' },
        },
        'radar-ping': {
          '0%':       { transform: 'scale(0.8)', opacity: '0.9' },
          '80%, 100%':{ transform: 'scale(2.4)', opacity: '0' },
        },
        'radar-sweep': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'skeleton-shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.85' },
        },
      },

      // ── Spacing extras ────────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
      },

      // ── Max widths ────────────────────────────────────────────────────
      maxWidth: {
        'app':    '560px',  // Mobile app max width
        'panel':  '720px',  // Dashboard panel
      },
    },
  },
  plugins: [],
}
