/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#231a73",
          light: "#3d34a5",
          dark: "#1a1357",
        },
        secondary: {
          DEFAULT: "#eeeeee",
          dark: "#d4d4d4",
        },
        background: {
          light: "#f6f6f8",
          dark: "#14131f",
        },
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        cairo: ["Cairo"],
        "cairo-bold": ["Cairo-Bold"],
        "cairo-semibold": ["Cairo-SemiBold"],
      },
    },
  },
  plugins: [],
};
