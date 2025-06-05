import { Metadata } from "next";
import { TermsContent } from "./components/TermsContent";
import "./styles.css";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Cosmo",
  description: "Términos y condiciones de uso de la plataforma Cosmo",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className=" rounded-lg shadow-xl p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Términos y Condiciones
          </h1>
          <div className="text-sm text-white mb-8">
            <p className="text-white">Fecha de vigencia: 1 de junio de 2025</p>
            <p className="text-white">
              Última actualización: 1 de junio de 2025
            </p>
          </div>
          <div className="prose prose-lg max-w-none prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-ul:text-gray-200 prose-li:text-gray-200 prose-th:text-white prose-td:text-gray-200">
            <TermsContent />
          </div>
        </div>
      </div>
    </div>
  );
}
