/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100%"
          }
        }
      },
      maxHeight: {
        "4/5": "80%"
      },
      maxWidth: {
        "1/2": "50%"
      }
    }
  },
  variants: {
    extend: {
      visibility: ["group-hover"]
    }
  },
  plugins: [require("@tailwindcss/typography")]
}
