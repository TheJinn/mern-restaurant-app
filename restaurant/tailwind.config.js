/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter','ui-sans-serif','system-ui','Segoe UI','Roboto','Helvetica','Arial'] },
      colors: { brand: { DEFAULT:"#111827", accent:"#f59e0b" } },
      borderRadius: { '2xl':'1rem' },
      boxShadow: { card:'0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)' }
    }
  },
  plugins: []
}
