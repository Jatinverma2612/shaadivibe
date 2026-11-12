/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        floral: {
          ivory: '#FFF9F4',       // Primary background Warm Ivory
          blush: '#F8E7E5',       // Supporting surface Soft Blush
          rose: '#D9A5A5',        // Dusty Rose accent
          burgundy: '#5C061D',    // Deep Burgundy for headlines and primary actions
          sage: '#9BAA91',        // Muted Sage for botanical accents
          gold: '#C9A24A',        // Antique Gold for decorative details
          brown: '#49352F',       // Warm Brown for readable body text
        },
        royal: {
          maroon: {
            950: '#260209',
            900: '#3A040E',
            800: '#4E0515',
            700: '#5C061D', // Primary brand burgundy/maroon
            600: '#751028',
            500: '#8E1C37',
            400: '#A92F4D',
            200: '#E7BAC5',
            100: '#F8E7E5', // Soft Blush
            50: '#FFF9F4',  // Warm Ivory
          },
          gold: {
            900: '#6B5009',
            800: '#8B6A10',
            700: '#AA8419',
            600: '#B89230',
            500: '#C9A24A', // Antique Gold
            400: '#D4AF37',
            300: '#E5C45B',
            200: '#F2D985',
            100: '#FAF1D6',
            50: '#FDFBF4',
          },
          ivory: {
            DEFAULT: '#FFF9F4', // Warm Ivory
            card: '#FFFFFF',
            warm: '#F8E7E5',    // Soft Blush
            border: '#EADCD7',
          },
          sage: {
            DEFAULT: '#9BAA91',
            light: '#C2CCC0',
            dark: '#718066',
          },
          rose: {
            DEFAULT: '#D9A5A5',
            light: '#F8E7E5',
            dark: '#B87B7B',
          },
          brown: {
            900: '#241712',
            800: '#36231C',
            700: '#49352F', // Warm Brown
            600: '#634B43',
            500: '#82685F',
            400: '#A38B82',
            300: '#C5B1AA',
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
