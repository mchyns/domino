/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-app)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          secondary: 'var(--bg-surface-secondary)',
          tertiary: 'var(--bg-surface-tertiary)',
        },
        ink: {
          DEFAULT: 'var(--text-ink)',
          secondary: 'var(--text-ink-secondary)',
          muted: 'var(--text-ink-muted)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
          dark: 'var(--border-dark)',
        },
        action: {
          DEFAULT: 'var(--action-bg)',
          hover: 'var(--action-hover)',
          text: 'var(--action-text)',
        },
        accent: {
          DEFAULT: 'var(--accent-color)',
        },
        tile: {
          ivory: '#FCFCFA',
          ivoryBack: '#242623',
          groove: '#C8C7C0',
          pip: '#191A18',
          border: '#D3D2CA',
        }
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'btn': '10px',
        'card': '14px',
        'modal': '18px',
        'tile': '9px',
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        'card': '0 2px 4px rgba(0,0,0,0.03), 0 12px 32px rgba(0,0,0,0.06)',
        'tile': '0 2px 6px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
        'tile-dark': '0 4px 12px rgba(0,0,0,0.45), 0 12px 28px rgba(0,0,0,0.4)',
        'tile-selected': '0 0 0 2px var(--text-ink), 0 8px 24px rgba(0,0,0,0.18)',
        'tile-hover': '0 4px 12px rgba(0,0,0,0.12), 0 12px 28px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
}
