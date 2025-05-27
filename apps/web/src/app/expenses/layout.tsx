import SustainabilityAnalysisClient from "../../components/expenses/SustainabilityAnalysisClient";

export default function ExpensesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      <div
        id="sustainability-analysis-container"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 hidden"
      >
        <div className="w-full max-w-4xl mx-4">
          <SustainabilityAnalysisClient />
        </div>
      </div>
    </div>
  );
}
