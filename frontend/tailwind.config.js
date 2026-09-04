/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Healing teal — replaces generic SaaS blue as the primary action color.
        brand: {
          50: '#EAF3F0',
          100: '#DCEAE6',
          200: '#B7D6CD',
          500: '#3E8977',
          600: '#2F6F62',
          700: '#245A4F',
        },
        // Warm parchment background + warm ink text, instead of stark white/black.
        paper: '#F6F2EA',
        ink: '#2A2622',
        line: '#E6DFD0',
        // Clay accent — used for wound-severity emphasis, not decoration.
        clay: {
          100: '#F3DFD8',
          500: '#C1533B',
          600: '#A8442F',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}