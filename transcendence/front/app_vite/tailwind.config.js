/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,js,html}", // this is the key part!
  ],
  theme: {
    extend: {},
    },
  plugins: [],
}

