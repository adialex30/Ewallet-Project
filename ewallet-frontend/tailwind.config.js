/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F7FB',
        ink: '#101828',
        primary: {
          DEFAULT: '#3654E0',
          dark: '#2A41B8',
          light: '#EEF1FD',
        },
        success: {
          DEFAULT: '#12875B',
          light: '#E7F6EF',
        },
        danger: {
          DEFAULT: '#D23B3B',
          light: '#FCEAEA',
        },
        pending: {
          DEFAULT: '#B5790A',
          light: '#FDF3E1',
        },
        line: '#E4E7EF',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
