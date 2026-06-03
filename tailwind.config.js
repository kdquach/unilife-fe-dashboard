/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        unilife: {
          DEFAULT: '#FF4A2B',
          dark: '#D9381E',
          soft: '#FFF1ED',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(17, 24, 39, 0.08)',
      },
    },
  },
  plugins: [],
};
