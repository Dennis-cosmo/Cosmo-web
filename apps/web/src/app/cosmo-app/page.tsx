"use client";
import { useState, useRef } from "react";

export default function Home() {
  // Estado para feedback del formulario
  const [leadStatus, setLeadStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [leadError, setLeadError] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Handler para el envío del formulario
  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLeadStatus("loading");
    setLeadError("");
    const form = e.currentTarget;
    const data = {
      companyName: form.companyName.value,
      contactEmail: form.contactEmail.value,
      contactName: form.contactName.value,
      message: form.message.value,
    };
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("No se pudo enviar el formulario");
      setLeadStatus("success");
      setShowToast(true);
      form.reset();
      setTimeout(() => setShowToast(false), 4000);
    } catch (err: any) {
      setLeadStatus("error");
      setLeadError(err.message || "Error desconocido");
    }
  };

  return (
    <>
      {/* Hero Section con mini dashboard */}
      <section className="bg-black text-white min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-eco-green/40 via-lime-accent/20 to-transparent animate-pulse"></div>
        <div className="container mx-auto px-4 relative z-10 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-8xl font-normal tracking-tight text-[#c5ff00] drop-shadow-[0_0_30px_rgba(197,255,0,0.6)] mb-6 opacity-0 animate-[fadeIn_1s_ease-out_forwards] transform transition-all duration-700 hover:scale-105 flex items-center justify-center">
              Cosmo
            </h1>
            <h2 className="text-5xl font-bold leading-tight mb-8 opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards]">
              <span className="text-white">Transforming</span>{" "}
              <span className="text-lime-accent bg-clip-text text-transparent bg-gradient-to-r from-lime-accent to-eco-green">
                Finance
              </span>
            </h2>
            <p className="text-xl mb-12 text-white/90 max-w-2xl mx-auto opacity-0 animate-[fadeIn_1s_ease-out_0.8s_forwards]">
              Cosmo automatically categorizes expenses towards the taxonomy ,
              calculates carbon footprints, and tracks sustainability
              performance.
            </p>
            <div className="flex justify-center space-x-6 opacity-0 animate-[fadeIn_1s_ease-out_1.1s_forwards]">
              <button className="bg-eco-green hover:bg-lime-accent text-cosmo-500 px-8 py-4 text-lg rounded-md transition-all hover:scale-105 font-medium">
                Get Started
              </button>
              <button className="bg-transparent border border-white/30 hover:border-lime-accent text-white px-8 py-4 rounded-md transition-all hover:scale-105">
                View Demo
              </button>
            </div>
          </div>

          {/* Mini Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto opacity-0 animate-[fadeIn_1s_ease-out_1.4s_forwards]">
            <div className="bg-cosmo-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-lime-accent/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Carbon Footprint
                </h3>
                <span className="text-eco-green text-sm">
                  -12% vs last month
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                2,450 tCO₂e
              </div>
              <div className="h-2 bg-cosmo-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-eco-green to-lime-accent w-3/4"></div>
              </div>
            </div>

            <div className="bg-cosmo-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-lime-accent/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Green Expenses
                </h3>
                <span className="text-eco-green text-sm">
                  +8% vs last month
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">68%</div>
              <div className="h-2 bg-cosmo-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-eco-green to-lime-accent w-2/3"></div>
              </div>
            </div>

            <div className="bg-cosmo-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-lime-accent/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">ESG Score</h3>
                <span className="text-eco-green text-sm">+5 points</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">7.4</div>
              <div className="h-2 bg-cosmo-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-eco-green to-lime-accent w-4/5"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-32 bg-black/95 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-eco-green/10 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Challenges in Sustainability Data and ESG Integration
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Understanding and overcoming the key challenges in sustainable
              finance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="group p-8 bg-cosmo-800/50 backdrop-blur-sm border border-white/10 rounded-xl hover:border-lime-accent/50 transition-all duration-300 hover:scale-105 hover:-translate-y-2">
              <div className="w-12 h-12 bg-eco-green/10 flex items-center justify-center rounded-lg mb-6">
                <svg
                  className="w-6 h-6 text-eco-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                Data Availability & Quality
              </h3>
              <p className="text-white/90">
                Many companies, especially small and medium-sized enterprises
                (SMEs), lack sufficient or consistent sustainability data.
                Limited or non-standardized disclosure practices across regions
                and industries make comparisons difficult.
              </p>
            </div>

            <div className="group p-8 bg-cosmo-800/50 backdrop-blur-sm border border-white/10 rounded-xl hover:border-lime-accent/50 transition-all duration-300 hover:scale-105 hover:-translate-y-2">
              <div className="w-12 h-12 bg-eco-green/10 flex items-center justify-center rounded-lg mb-6">
                <svg
                  className="w-6 h-6 text-eco-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                Standardized Metrics
              </h3>
              <p className="text-white/90">
                Data is often reported using different methodologies (e.g.,
                carbon footprint calculation, water usage). Inconsistent
                definitions of key sustainability metrics (e.g., "net-zero,"
                "renewable energy").
              </p>
            </div>

            <div className="group p-8 bg-cosmo-800/50 backdrop-blur-sm border border-white/10 rounded-xl hover:border-lime-accent/50 transition-all duration-300 hover:scale-105 hover:-translate-y-2">
              <div className="w-12 h-12 bg-eco-green/10 flex items-center justify-center rounded-lg mb-6">
                <svg
                  className="w-6 h-6 text-eco-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                Reliability & Verification
              </h3>
              <p className="text-white/90">
                Companies may engage in greenwashing by overstating their
                sustainability credentials. Difficulty in verifying the
                authenticity of self-reported ESG data.
              </p>
            </div>

            <div className="group p-8 bg-cosmo-800/50 backdrop-blur-sm border border-white/10 rounded-xl hover:border-lime-accent/50 transition-all duration-300 hover:scale-105 hover:-translate-y-2">
              <div className="w-12 h-12 bg-eco-green/10 flex items-center justify-center rounded-lg mb-6">
                <svg
                  className="w-6 h-6 text-eco-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                Complex Supply Chains
              </h3>
              <p className="text-white/90">
                Companies may not have visibility into the ESG performance of
                their suppliers, making it hard for funds to assess total
                impact.
              </p>
            </div>

            <div className="group p-8 bg-cosmo-800/50 backdrop-blur-sm border border-white/10 rounded-xl hover:border-lime-accent/50 transition-all duration-300 hover:scale-105 hover:-translate-y-2">
              <div className="w-12 h-12 bg-eco-green/10 flex items-center justify-center rounded-lg mb-6">
                <svg
                  className="w-6 h-6 text-eco-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                Dynamic Regulatory Environment
              </h3>
              <p className="text-white/90">
                Evolving requirements from SFDR and other sustainability
                frameworks (e.g., EU Taxonomy) make compliance a moving target.
              </p>
            </div>

            <div className="group p-8 bg-cosmo-800/50 backdrop-blur-sm border border-white/10 rounded-xl hover:border-lime-accent/50 transition-all duration-300 hover:scale-105 hover:-translate-y-2">
              <div className="w-12 h-12 bg-eco-green/10 flex items-center justify-center rounded-lg mb-6">
                <svg
                  className="w-6 h-6 text-eco-green"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                Integration into Financial Models
              </h3>
              <p className="text-white/90">
                Funds struggle to integrate ESG data into their financial
                analysis and risk assessment in a meaningful way. Balancing
                financial performance with sustainability goals can be
                challenging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-eco-green/20 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Ready to Transform Your Sustainable Impact?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join the companies already leading the change with Cosmo
            </p>
            <div className="flex justify-center space-x-6">
              <button className="bg-eco-green hover:bg-lime-accent text-cosmo-500 px-8 py-4 text-lg rounded-md transition-all hover:scale-105 font-medium">
                Free Trial
              </button>
              <button className="bg-transparent border border-white/30 hover:border-lime-accent text-white px-8 py-4 rounded-md transition-all hover:scale-105">
                Contact Sales
              </button>
            </div>
          </div>
          {/* Formulario de interés para empresas */}
          <div className="max-w-2xl mx-auto mt-12 bg-cosmo-800/80 border border-eco-green/30 rounded-2xl shadow-lg p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-2 text-center">
              ¿Listo para transformar el impacto sostenible de tu empresa?
            </h3>
            <p className="text-white/80 mb-6 text-center">
              Solicita acceso anticipado y prueba Cosmo en tu organización.
            </p>
            <form
              className="space-y-6"
              ref={formRef}
              onSubmit={handleLeadSubmit}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Nombre de la empresa
                  </label>
                  <input
                    type="text"
                    required
                    name="companyName"
                    className="w-full px-4 py-2 rounded-md bg-cosmo-700 border border-eco-green/30 text-white focus:ring-2 focus:ring-eco-green focus:outline-none"
                    placeholder="Ej: GreenTech Solutions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Email de contacto
                  </label>
                  <input
                    type="email"
                    required
                    name="contactEmail"
                    className="w-full px-4 py-2 rounded-md bg-cosmo-700 border border-eco-green/30 text-white focus:ring-2 focus:ring-eco-green focus:outline-none"
                    placeholder="nombre@empresa.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    required
                    name="contactName"
                    className="w-full px-4 py-2 rounded-md bg-cosmo-700 border border-eco-green/30 text-white focus:ring-2 focus:ring-eco-green focus:outline-none"
                    placeholder="Nombre y apellido"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Mensaje o interés (opcional)
                  </label>
                  <input
                    type="text"
                    name="message"
                    className="w-full px-4 py-2 rounded-md bg-cosmo-700 border border-eco-green/30 text-white focus:ring-2 focus:ring-eco-green focus:outline-none"
                    placeholder="¿Qué te gustaría lograr con Cosmo?"
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={leadStatus === "loading"}
                  className="bg-eco-green hover:bg-lime-accent text-cosmo-900 font-semibold px-8 py-3 rounded-md shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-eco-green focus:ring-offset-2"
                >
                  Solicitar acceso
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      {showToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-eco-green text-cosmo-900 px-6 py-3 rounded-lg shadow-lg font-semibold animate-fadeIn">
          ¡Datos enviados con éxito! Nos pondremos en contacto contigo pronto.
        </div>
      )}
    </>
  );
}
