"use client";

import { useEffect } from "react";

export default function SustainabilityAnalysisButton() {
  useEffect(() => {
    const handleClick = () => {
      console.log("Botón de análisis clickeado");
      const event = new CustomEvent("analyze-sustainability");
      window.dispatchEvent(event);
      const container = document.getElementById(
        "sustainability-analysis-container"
      );
      if (container) {
        container.classList.remove("hidden");
      }
    };

    const button = document.getElementById("sustainability-analysis-button");
    if (button) {
      button.addEventListener("click", handleClick);
    }

    return () => {
      if (button) {
        button.removeEventListener("click", handleClick);
      }
    };
  }, []);

  return (
    <button
      type="button"
      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-black bg-eco-green hover:bg-eco-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
      id="sustainability-analysis-button"
    >
      <svg
        className="-ml-1 mr-2 h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
          clipRule="evenodd"
        />
      </svg>
      Análisis de Sostenibilidad
    </button>
  );
}
