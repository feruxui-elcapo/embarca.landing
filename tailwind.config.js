/** @type {import('tailwindcss').Config} */
// Misma configuración que usaba el CDN (cdn.tailwindcss.com 3.4.17) en index.html,
// ahora compilada en build para no generar CSS en el navegador.
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./main.tsx",
    "./components/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        pixel: ['VT323', 'monospace']
      }
    }
  },
  plugins: []
};
