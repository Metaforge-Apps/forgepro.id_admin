/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#D9B06F',
          light: '#E6C68D',
          dark: '#B88E4F',
          gold: '#D9B06F',
        },
        // Semantic design token mappings
        surface: {
          main: 'var(--color-bg-main)',
          card: 'var(--color-bg-card)',
          sidebar: 'var(--color-bg-sidebar)',
          hover: 'var(--color-bg-hover)',
          active: 'var(--color-bg-active)',
          input: 'var(--color-bg-input)',
          button: 'var(--color-bg-button)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          card: 'var(--color-border-card)',
          input: 'var(--color-border-input)',
          active: 'var(--color-border-active)',
        },
        content: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          accent: 'var(--color-accent)',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        'card-light': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'gold-glow': '0 0 25px -5px rgba(217, 176, 111, 0.25)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      }
    },
  },
  plugins: [],
};
