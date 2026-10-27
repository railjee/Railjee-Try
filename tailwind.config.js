/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Copied from the main site's tailwind.config.ts so the exam UI matches.
      fontSize: {
        xxs: ['0.60rem', { lineHeight: '0.75rem' }],
      },
    },
  },
  plugins: [],
};
