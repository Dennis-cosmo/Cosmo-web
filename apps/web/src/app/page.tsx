export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Bienvenido a Cosmo
        </h1>
        
        <div className="card mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Plataforma de finanzas sostenibles
          </h2>
          <p className="mb-4">
            Gestiona tus gastos y reportes de sostenibilidad en un solo lugar.
            Cumple con las normativas europeas de ESG y optimiza tu estrategia financiera.
          </p>
          <div className="flex space-x-4">
            <button className="btn-primary">Iniciar sesión</button>
            <button className="btn-secondary">Más información</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Automatización de gastos</h3>
            <p>Clasifica automáticamente tus transacciones con IA y obtén insights valiosos.</p>
          </div>
          
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Reportes ESG</h3>
            <p>Genera reportes de sostenibilidad conformes con CSRD y ESRS.</p>
          </div>
          
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Integración con ERPs</h3>
            <p>Conecta con SAP, QuickBooks y otros sistemas financieros populares.</p>
          </div>
          
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Análisis de sostenibilidad</h3>
            <p>Monitorea tu huella de carbono y recibe recomendaciones para inversiones verdes.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 