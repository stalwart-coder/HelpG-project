/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1B2340',
          soft: '#5B6180',
        },
        marigold: {
          DEFAULT: '#E8A23D',
          deep: '#C67E1F',
        },
        banyan: '#2F7D5C',
        brick: '#C0512F',
        paper: {
          DEFAULT: '#EDEEE9',
          card: '#FCFBF8',
        },
        line: '#D9D9D2',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 8px 24px rgba(27,35,64,0.08)',
        'card-hover': '0 12px 28px rgba(27,35,64,0.12)',
        lift: '0 16px 32px rgba(27,35,64,0.16)',
        'lift-lg': '0 24px 48px rgba(27,35,64,0.18)',
        soft: '0 2px 8px rgba(27,35,64,0.06)',
        inner: 'inset 0 1px 3px rgba(27,35,64,0.06)',
      },
      borderRadius: {
        card: '14px',
        '2xl': '16px',
        '3xl': '20px',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'fade-in-up': 'fade-in-up 0.45s ease-out both',
        'fade-in-down': 'fade-in-down 0.35s ease-out both',
        'scale-in': 'scale-in 0.35s ease-out both',
        'skeleton-pulse': 'skeleton-pulse 1.8s ease-in-out infinite',
        'skeleton-shimmer': 'skeleton-shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'skeleton-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
