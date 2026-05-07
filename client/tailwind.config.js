/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1E6FD9',
          'blue-light': '#EBF3FF',
          'blue-dark': '#154FA3',
        },
        surface: '#FFFFFF',
        'surface-2': '#F7F9FC',
        text: {
          primary: '#0F1923',
          secondary: '#4B5563',
        },
        success: '#10B981',
        error: '#EF4444',
      },
      fontFamily: {
        livvic: ['Livvic', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
      },
      boxShadow: {
        'brand': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
      }
    },
  },
  plugins: [],
}
