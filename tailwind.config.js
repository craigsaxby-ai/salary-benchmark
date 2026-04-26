/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: '#0A0F1E',
        card: '#141929',
        border: '#1E2740',
        orange: '#FF6B2B',
        green: '#10B981',
      },
    },
  },
  plugins: [],
}
