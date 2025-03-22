/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable dark mode class-based toggling
  theme: {
    extend: {
      fontFamily: {
        sans: ['Source Code Pro', ...defaultTheme.fontFamily.sans],
        heading: ['Poppins', 'poppins'],
      },
      width: {
        '8/10': '90%',
        '2/10': '10%',
      },
      colors: {
        primary: {
          light: '#fff',
          dark: '#000',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        s,
      },
      backgroundColor: {
        'glassmorphic-light': 'var(--bg-glassmorphic-light)',
        'glassmorphic-dark': 'var(--bg-glassmorphic-dark)',
      },
      backdropBlur: {
        glassmorphic: '1px',
      },
      borderRadius: {
        glassmorphic: '10px',
      },
      borderColor: {
        'glassmorphic-light': 'var(--border-glassmorphic-light)',
        'glassmorphic-dark': 'var(--border-glassmorphic-dark)',
      },
      animation: {
        'text-slide':
          'text-slide 12.5s cubic-bezier(0.83, 0, 0.17, 1) infinite',
      },
      keyframes: {
        'text-slide': {
          '0%, 16%': {
            transform: 'translateY(0%)',
          },
          '20%, 36%': {
            transform: 'translateY(-16.66%)',
          },
          '40%, 56%': {
            transform: 'translateY(-33.33%)',
          },
          '60%, 76%': {
            transform: 'translateY(-50%)',
          },
          '80%, 96%': {
            transform: 'translateY(-66.66%)',
          },
          '100%': {
            transform: 'translateY(-83.33%)',
          },
        },
      },
    },
  },
  plugins: [],
};
