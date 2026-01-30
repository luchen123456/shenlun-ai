module.exports = {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './types.ts',
    './components/**/*.{ts,tsx}',
    './api/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0056D2',
        'primary-dark': '#0953b8',
        'background-light': '#f5f7f8',
        'background-dark': '#0f1723',
        success: '#28a745',
        warning: '#fd7e14',
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'sans-serif'],
        display: ['Public Sans', 'Noto Sans SC', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries'), require('@tailwindcss/typography')],
};
