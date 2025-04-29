/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        contrast: "#217B61"
      }
    },
  },
  plugins: [
    require('daisyui')
  ],
  daisyui: {
    themes: [
      'light',
      'dark',
      // якщо потрібні ще — наприклад 'cupcake','garden' і т.д.
    ]
  }
}
