/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00d9ff',
        secondary: '#a78bfa',
        accent: '#ff006e',
        bgdark: '#0a0e27',
      },
      boxShadow: {
        glow: '0 0 20px rgba(0,217,255,0.3)',
      }
    },
  },
  plugins: [],
}
