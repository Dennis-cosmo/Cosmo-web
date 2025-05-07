import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import CompanyProfile from "@/components/dashboard/CompanyProfile";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Panel de Control</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-cosmo-800 rounded-lg shadow p-6">
            <CompanyProfile />
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-cosmo-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Resumen</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total de gastos
                </p>
                <p className="text-2xl font-medium">€0</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Puntuación sostenibilidad
                </p>
                <p className="text-2xl font-medium text-eco-green">--</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
