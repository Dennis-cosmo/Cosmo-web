export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-deep-space to-cosmo-400 text-pure-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-5xl font-bold leading-tight mb-6">
                Gestión de{" "}
                <span className="text-lime-accent">finanzas sostenibles</span>{" "}
                para empresas comprometidas
              </h1>
              <p className="text-lg mb-8 text-grey-stone">
                Automatiza el seguimiento de gastos y reportes de sostenibilidad
                para cumplir con las normativas ESG y optimizar tu impacto
                ambiental.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="btn-primary px-8 py-3 text-lg">
                  Comenzar ahora
                </button>
                <button className="bg-transparent border border-grey-stone hover:border-lime-accent text-pure-white px-8 py-3 rounded-md transition-colors text-lg">
                  Ver demo
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md bg-deep-space rounded-xl border border-grey-stone/30 shadow-xl overflow-hidden">
                <div className="bg-eco-green px-4 py-2 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-sm text-white">Dashboard Cosmo</div>
                  <div></div>
                </div>
                <div className="p-6">
                  <div className="text-2xl font-bold mb-6 text-pure-white">
                    Dashboard Financiero
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-cosmo-300 p-4 rounded-lg">
                      <div className="text-sm text-grey-stone">
                        Gastos Mensuales
                      </div>
                      <div className="text-xl font-bold text-pure-white">
                        €24,500
                      </div>
                      <div className="text-lime-accent text-sm">
                        -12% vs mes anterior
                      </div>
                    </div>
                    <div className="bg-cosmo-300 p-4 rounded-lg">
                      <div className="text-sm text-grey-stone">
                        Huella de Carbono
                      </div>
                      <div className="text-xl font-bold text-pure-white">
                        3.8 tons
                      </div>
                      <div className="text-lime-accent text-sm">
                        -8% vs mes anterior
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between mb-2">
                      <div className="text-sm text-grey-stone">
                        Gastos Sostenibles
                      </div>
                      <div className="text-sm text-pure-white">68%</div>
                    </div>
                    <div className="w-full bg-cosmo-300 rounded-full h-2">
                      <div
                        className="bg-lime-accent h-2 rounded-full"
                        style={{ width: "68%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Características principales
            </h2>
            <p className="text-xl text-grey-stone max-w-3xl mx-auto">
              Todo lo que necesitas para gestionar tus finanzas con un enfoque
              sostenible
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card-hover">
              <div className="w-12 h-12 bg-eco-green/10 flex items-center justify-center rounded-lg mb-4">
                <svg
                  className="w-6 h-6 text-eco-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Automatización de gastos
              </h3>
              <p className="text-grey-stone">
                Clasifica automáticamente tus transacciones con IA y obtén
                insights valiosos.
              </p>
            </div>

            <div className="card-hover">
              <div className="w-12 h-12 bg-eco-green/10 flex items-center justify-center rounded-lg mb-4">
                <svg
                  className="w-6 h-6 text-eco-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Reportes ESG</h3>
              <p className="text-grey-stone">
                Genera reportes de sostenibilidad conformes con CSRD y ESRS.
              </p>
            </div>

            <div className="card-hover">
              <div className="w-12 h-12 bg-eco-green/10 flex items-center justify-center rounded-lg mb-4">
                <svg
                  className="w-6 h-6 text-eco-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Integración con ERPs
              </h3>
              <p className="text-grey-stone">
                Conecta con SAP, QuickBooks y otros sistemas financieros
                populares.
              </p>
            </div>

            <div className="card-hover">
              <div className="w-12 h-12 bg-eco-green/10 flex items-center justify-center rounded-lg mb-4">
                <svg
                  className="w-6 h-6 text-eco-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Análisis de sostenibilidad
              </h3>
              <p className="text-grey-stone">
                Monitorea tu huella de carbono y recibe recomendaciones para
                inversiones verdes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-section mx-4 md:mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-2/3 mb-6 md:mb-0">
            <h2 className="text-3xl font-bold mb-2">
              ¿Listo para transformar tus finanzas?
            </h2>
            <p className="text-grey-stone">
              Únete a las empresas que ya están haciendo la diferencia con
              Cosmo.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button className="btn-primary">Prueba gratuita</button>
            <button className="btn-outline">Contactar ventas</button>
          </div>
        </div>
      </section>
    </>
  );
}
