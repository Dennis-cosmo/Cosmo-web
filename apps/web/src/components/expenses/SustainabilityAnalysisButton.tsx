"use client";

import { useEffect, useState } from "react";

export default function SustainabilityAnalysisButton() {
  const [hasLastAnalysis, setHasLastAnalysis] = useState(false);

  useEffect(() => {
    // Verificar si existe un análisis previo en sessionStorage
    const lastAnalysis = sessionStorage.getItem("lastSustainabilityAnalysis");
    setHasLastAnalysis(!!lastAnalysis);

    const handleClick = () => {
      console.log("Botón de análisis clickeado");
      const event = new CustomEvent("analyze-sustainability", {
        detail: { isNew: true },
      });
      window.dispatchEvent(event);
      const container = document.getElementById(
        "sustainability-analysis-container"
      );
      if (container) {
        container.classList.remove("hidden");
      }
    };

    const handleViewLastClick = () => {
      console.log("Botón de ver último análisis clickeado");
      const event = new CustomEvent("view-last-analysis");
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

    const viewLastButton = document.getElementById("view-last-analysis-button");
    if (viewLastButton) {
      viewLastButton.addEventListener("click", handleViewLastClick);
    }

    return () => {
      if (button) {
        button.removeEventListener("click", handleClick);
      }
      if (viewLastButton) {
        viewLastButton.removeEventListener("click", handleViewLastClick);
      }
    };
  }, []);

  return (
    <div className="flex space-x-2">
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
        Nuevo Análisis
      </button>

      {hasLastAnalysis && (
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-eco-green shadow-sm text-sm font-medium rounded-md text-eco-green bg-transparent hover:bg-eco-green/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-eco-green"
          id="view-last-analysis-button"
        >
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 12a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
          Ver Último Análisis
        </button>
      )}
    </div>
  );
}
