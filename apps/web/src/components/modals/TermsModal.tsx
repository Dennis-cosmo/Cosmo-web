import { useEffect, useRef } from "react";
import { TermsContent } from "../../app/terms/components/TermsContent";
import { motion, AnimatePresence } from "framer-motion";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Manejar el cierre con la tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Manejar clic fuera del modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 overflow-y-auto"
          onClick={handleBackdropClick}
        >
          {/* Backdrop con blur y gradiente */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-sm transition-opacity"
          />

          {/* Contenedor del modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-4xl transform overflow-hidden rounded-lg bg-black/90 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:p-6 border border-eco-green/20"
            >
              {/* Línea decorativa superior */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-eco-green/0 via-eco-green to-eco-green/0" />

              {/* Botón de cierre */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="absolute right-4 top-4 rounded-md text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-eco-green focus:ring-offset-2 focus:ring-offset-gray-900"
                onClick={onClose}
              >
                <span className="sr-only">Cerrar</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.button>

              {/* Contenido del modal */}
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <motion.h3
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-semibold leading-6 text-white mb-4"
                  >
                    Términos y Condiciones
                  </motion.h3>
                  <div className="mt-2 prose prose-lg max-w-none">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-sm text-white mb-8"
                    >
                      <p className="text-white">
                        Fecha de vigencia: 1 de junio de 2025
                      </p>
                      <p className="text-white">
                        Última actualización: 1 de junio de 2025
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar"
                    >
                      <TermsContent />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-eco-green px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-lime-accent focus:outline-none focus:ring-2 focus:ring-eco-green focus:ring-offset-2 sm:ml-3 sm:w-auto transition-colors duration-200"
                  onClick={onClose}
                >
                  Entendido
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
