/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 18px 60px rgba(37, 99, 235, 0.22)"
      }
    }
  },
  plugins: []
};
