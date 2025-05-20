/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Colores principales
        cosmo: {
          300: "#1A1A1A",
          400: "#2A2A2A",
          500: "#0A0A0A",
          800: "#1A1A1A",
        },
        // Colores actualizados para mejor contraste
        "eco-green": "#c5ff00", // Verde neón principal
        "lime-accent": "#57D9A3", // Verde secundario más apagado
        "pure-white": "#FFFFFF",

        // Escala de negro para fondos y elementos oscuros
        cosmo: {
          DEFAULT: "#000000", // Negro base
          50: "#1A1A1A",
          100: "#141414",
          200: "#0F0F0F",
          300: "#0A0A0A",
          400: "#050505",
          500: "#000000", // Base - Negro puro
          600: "#000000",
          700: "#000000",
          800: "#000000",
          900: "#000000",
        },

        // Escala de grises para textos y elementos neutros
        neutral: {
          DEFAULT: "#2D2D2D", // Charcoal
          50: "#F5F5F5",
          100: "#E1E1E1", // Soft Grey
          200: "#C8C8C8",
          300: "#A8A8A8", // Grey Stone
          400: "#888888",
          500: "#6F6F6F",
          600: "#525252",
          700: "#393939",
          800: "#2D2D2D", // Charcoal
          900: "#171717",
        },

        // Escala de verde para elementos primarios actualizada
        primary: {
          DEFAULT: "#c5ff00", // Verde neón principal
          50: "#faffd6",
          100: "#f4ffad",
          200: "#eaff6b",
          300: "#e0ff29",
          400: "#d6ff00",
          500: "#c5ff00", // Verde neón principal
          600: "#a0cc00",
          700: "#7a9900",
          800: "#546600",
          900: "#2d3300",
        },

        // Escala de lima para elementos secundarios actualizada
        secondary: {
          DEFAULT: "#57D9A3", // Base - Lima actualizado
          50: "#EAFBF3",
          100: "#D5F7E7",
          200: "#ABF0CF",
          300: "#81E8B7",
          400: "#57D9A3", // Base - Lime Accent
          500: "#33C087",
          600: "#29A070",
          700: "#218059",
          800: "#186042",
          900: "#0F402C",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-instrument-sans)",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 10px rgba(168, 168, 168, 0.1)", // Sombra ligera con Grey Stone a 10% de opacidad
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        bounce: {
          "0%, 100%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(-25%)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
      },
      animation: {
        "fade-in": "fadeIn 1s ease-out forwards",
        fadeIn: "fadeIn 0.5s ease-out forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        bounce: "bounce 1s infinite",
      },
    },
  },
  plugins: [],
};
