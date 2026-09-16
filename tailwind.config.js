/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f9f4',
          100: '#d9f0e3',
          200: '#b4e0c8',
          300: '#81c9a5',
          400: '#4dac7e',
          500: '#2a8f5f',
          600: '#1B5E3B', // primary
          700: '#174f32',
          800: '#143f28',
          900: '#103321',
        },
        stone: {
          50: '#FAFAF7',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
