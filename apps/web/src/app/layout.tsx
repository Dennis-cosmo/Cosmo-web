import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cosmo - Plataforma de Finanzas Sostenibles",
  description:
    "Automatización de seguimiento de gastos y reportes de sostenibilidad para cumplimiento ESG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <Header />
        <main>{children}</main>
        <footer className="bg-deep-space text-pure-white p-6 mt-12">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Cosmo</h3>
                <p className="text-soft-grey">
                  Automatizando la sostenibilidad financiera para empresas
                  comprometidas con el planeta.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Producto</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="nav-link">
                      Funcionalidades
                    </a>
                  </li>
                  <li>
                    <a href="#" className="nav-link">
                      Precios
                    </a>
                  </li>
                  <li>
                    <a href="#" className="nav-link">
                      Integraciones
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Recursos</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="nav-link">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="nav-link">
                      Documentación
                    </a>
                  </li>
                  <li>
                    <a href="#" className="nav-link">
                      Casos de éxito
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Contacto</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="nav-link">
                      Soporte
                    </a>
                  </li>
                  <li>
                    <a href="#" className="nav-link">
                      Ventas
                    </a>
                  </li>
                  <li>
                    <a href="#" className="nav-link">
                      Demo
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-grey-stone/30 mt-8 pt-6 text-center text-grey-stone">
              <p>
                © {new Date().getFullYear()} Cosmo. Todos los derechos
                reservados.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
