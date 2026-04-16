/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:     ['Bellota', 'sans-serif'],
        caveat:   ['Caveat', 'cursive'],
        ruluko:   ['Ruluko', 'sans-serif'],
        overlock: ['Overlock', 'sans-serif'],
        bellota:  ['Bellota', 'sans-serif'],
        sniglet:  ['Sniglet', 'cursive'],
        capriola: ['Capriola', 'sans-serif'],
        marck:    ['"Marck Script"', 'cursive'],
        serif:    ['"Source Serif 4"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
