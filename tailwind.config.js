/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Style Guide Theme Colors
        primary: {
          DEFAULT: '#5F6B4E', // Green
          dark: '#4A543C',
          light: '#DFE4D9',
        },
        secondary: {
          DEFAULT: '#C57B57', // Clay/Rust
          dark: '#AC6745',
          light: '#F6ECE7',
        },
        tertiary: {
          DEFAULT: '#F2E9DC', // Cream Background Accent
          dark: '#E2D5C4',
        },
        neutral: {
          DEFAULT: '#2D2D2A', // Charcoal text/elements
          muted: '#8B8B88',
          bg: '#F9F8F6',      // Soft warm base
        },
        lavender: {
          DEFAULT: '#E8E8F2',
        },
        
        // Keep earth/sage/clay compatibility for other pages but map them to the new palette!
        earth: {
          50: '#F9F8F6',  // Neutral BG
          100: '#F2E9DC', // Tertiary
          200: '#EADFCF',
          300: '#D0C2B0',
          400: '#AFA08C',
          500: '#8B8B88', // Neutral Muted
          600: '#686865',
          700: '#4D4D4A',
          800: '#3A3A37',
          900: '#2D2D2A', // Neutral
        },
        sage: {
          50: '#F6F7F5',
          100: '#DFE4D9',
          200: '#C2CBB8',
          300: '#A4B296',
          400: '#869874',
          500: '#5F6B4E', // Primary
          600: '#4A543C',
          700: '#3A422F',
          800: '#2A3022',
          900: '#1A1E15',
        },
        clay: {
          50: '#FAF6F4',
          100: '#F6ECE7',
          200: '#ECD2C4',
          300: '#DFAB93',
          400: '#D1815F',
          500: '#C57B57', // Secondary
          600: '#AC6745',
          700: '#8E5133',
          800: '#6B3C24',
          900: '#472615',
        },
      },
      fontFamily: {
        sans: ['Hanken Grotesk', 'sans-serif'],
        serif: ['Eb Garamond', 'serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
      }
    },
  },
  plugins: [],
}
