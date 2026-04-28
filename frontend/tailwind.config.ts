import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1D6B4F',
          light: '#E1F5EE',
          dark: '#0D4A36',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
