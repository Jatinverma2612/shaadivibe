/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        royal: {
          maroon: {
            950: '#260209',
            900: '#3A040E',
            800: '#4E0515',
            700: '#5C061D', // Primary brand maroon
            600: '#751028',
            500: '#8E1C37',
            400: '#A92F4D',
            200: '#E7BAC5',
            100: '#F5DEE3',
            50: '#FDF7F8',
          },
          gold: {
            900: '#6B5009',
            800: '#8B6A10',
            700: '#AA8419',
            600: '#C79E26',
            500: '#D4AF37', // Royal Antique Gold
            400: '#E5C45B',
            300: '#F2D985',
            200: '#F7E7B2',
            100: '#FBF3DA',
            50: '#FDFBF4',
          },
          ivory: {
            DEFAULT: '#FAF7F2',
            card: '#FFFDF9',
            warm: '#F4EFE6',
            border: '#E8DFD1',
          },
          brown: {
            900: '#1C0F0A',
            800: '#2A1810', // Deep brown text
            700: '#4A3024',
            600: '#684738',
            500: '#8A6453',
            400: '#AD8978',
            300: '#D1B4A6',
          },
          marigold: {
            DEFAULT: '#E67A15',
            light: '#F8A542',
            dark: '#B85805',
          },
        },
      },
      fontFamily: {
        serif: ['Cinzel', 'Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'royal': '0 10px 30px -5px rgba(92, 6, 29, 0.15), 0 4px 10px -2px rgba(212, 175, 55, 0.1)',
        'royal-lg': '0 20px 40px -10px rgba(92, 6, 29, 0.25), 0 8px 20px -4px rgba(212, 175, 55, 0.2)',
        'gold-glow': '0 0 25px rgba(212, 175, 55, 0.45)',
        'wax-seal': 'inset 0 2px 4px rgba(255, 255, 255, 0.4), 0 6px 16px rgba(58, 4, 14, 0.45)',
      },
    },
  },
  plugins: [],
}
