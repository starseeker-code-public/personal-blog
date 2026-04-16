/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tomorrow', 'sans-serif'],
        anta: ['Anta', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        baumans: ['Baumans', 'system-ui'],
        megrim: ['Megrim', 'system-ui'],
        'nova-flat': ['Nova Flat', 'system-ui'],
        'nova-round': ['Nova Round', 'system-ui'],
        'press-start': ['"Press Start 2P"', 'system-ui'],
        tomorrow: ['Tomorrow', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
