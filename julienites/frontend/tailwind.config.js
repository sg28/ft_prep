/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Use class-based dark mode
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Twitter/X-like colors
        twitter: {
          blue: '#1d9bf0',
          blueHover: '#1a8cd8',
          pink: '#f91880',
          green: '#00ba7c',
        },
        // Theme colors
        background: {
          primary: 'var(--background-primary)',
          secondary: 'var(--background-secondary)',
          tertiary: 'var(--background-tertiary)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        border: 'var(--border-color)',
        button: {
          bg: 'var(--button-bg)',
          text: 'var(--button-text)',
          hover: 'var(--button-hover)',
        },
        'success-color': 'var(--success-color)',
      },
      spacing: {
        'sidebar-expanded': '275px',
        'sidebar-collapsed': '88px',
        'feed-width': '600px',
        'sidebar-width': '350px',
      },
      borderRadius: {
        'full': '9999px',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}