/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hot-pink': '#FF1493',
        'light-pink': '#FF69B4',
        'neon-blue': '#00BFFF',
        'dodger-blue': '#1E90FF',
        'deep-purple': '#1a0a2e',
        'midnight': '#0d0d1a',
      },
      backgroundImage: {
        'gradient-pink-blue': 'linear-gradient(135deg, #FF1493 0%, #1E90FF 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a0a2e 0%, #0d0d1a 50%, #0a1628 100%)',
      },
      boxShadow: {
        'neon-pink': '0 0 20px rgba(255, 20, 147, 0.5)',
        'neon-blue': '0 0 20px rgba(0, 191, 255, 0.5)',
        'neon-glow': '0 0 30px rgba(255, 20, 147, 0.3), 0 0 60px rgba(0, 191, 255, 0.2)',
      },
    },
  },
  plugins: [],
}
