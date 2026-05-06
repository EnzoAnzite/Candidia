/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#01696f',
          hover:   '#0c4e54',
          light:   '#d9e8e5',
        },
      },
    },
  },
  plugins: [],
};