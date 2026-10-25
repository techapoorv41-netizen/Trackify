/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        page: v('page'),
        card: v('card'),
        soft: v('soft'),
        ink: v('ink'),
        muted: v('muted'),
        line: v('line'),
        sidebar: v('sidebar'),
        navy: v('navy'),
        brand: v('brand'),
        accent: { DEFAULT: v('accent'), 50: v('accent-50'), 100: v('accent-100') },
        success: { DEFAULT: v('success'), 50: v('success-50'), 100: v('success-100') },
        warning: { DEFAULT: v('warning'), 50: v('warning-50'), 100: v('warning-100') },
        danger: { DEFAULT: v('danger'), 50: v('danger-50'), 100: v('danger-100') },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(23,43,77,0.04), 0 1px 3px rgba(23,43,77,0.06)',
        pop: '0 12px 32px -8px rgba(23,43,77,0.22)',
      },
    },
  },
  plugins: [],
};
