/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Colores principales de Cosmo
        "eco-green": "#3E9D0A", // Primario - Green Eco
        "lime-accent": "#C6FF00", // Secundario - Lime Accent
        charcoal: "#2D2D2D", // Neutro oscuro - Charcoal
        "grey-stone": "#A8A8A8", // Neutro medio - Grey Stone
        "soft-grey": "#E1E1E1", // Neutro claro - Soft Grey
        "pure-white": "#FFFFFF", // Fondo - Pure White
        "deep-space": "#0F1B2A", // Acento "Cosmo" - Deep Space Blue

        // Actualizamos las scales de primary y secondary para que concuerden con nuestra paleta
        primary: {
          DEFAULT: "#3E9D0A", // Green Eco
          50: "#F0FFE6",
          100: "#E1FFCC",
          200: "#C3FF99",
          300: "#9DFF5C",
          400: "#70FF19",
          500: "#3E9D0A", // Base - Green Eco
          600: "#368809",
          700: "#2E7408",
          800: "#265F06",
          900: "#1E4B05",
        },
        secondary: {
          DEFAULT: "#C6FF00", // Lime Accent
          50: "#F9FFE6",
          100: "#F3FFCC",
          200: "#E6FF99",
          300: "#DAFF66",
          400: "#D0FF33",
          500: "#C6FF00", // Base - Lime Accent
          600: "#A3D100",
          700: "#7FA400",
          800: "#5C7600",
          900: "#384800",
        },
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
        cosmo: {
          DEFAULT: "#0F1B2A", // Deep Space Blue
          50: "#4A7AC2",
          100: "#3E6DB4",
          200: "#345995",
          300: "#2A4676",
          400: "#1F3456",
          500: "#0F1B2A", // Base - Deep Space Blue
          600: "#0A121D",
          700: "#05090F",
          800: "#000102",
          900: "#000000",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 10px rgba(168, 168, 168, 0.1)", // Sombra ligera con Grey Stone a 10% de opacidad
      },
    },
  },
  plugins: [],
};
