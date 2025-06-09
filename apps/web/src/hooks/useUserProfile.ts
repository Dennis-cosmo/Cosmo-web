import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { get } from "../lib/api";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  industry?: string;
  companyLegalName?: string;
  taxId?: string;
  companySize?: string;
  website?: string;
  country?: string;
  address?: string;
  sustainabilityLevel?: string;
  sustainabilityGoals?: string[];
  certifications?: string[];
  sustainabilityBudgetRange?: string;
  sustainabilityNotes?: string;
  createdAt?: string;
  euTaxonomySectorIds?: number[];
  euTaxonomySectorNames?: string[];
  euTaxonomyActivities?: any[];
  taxonomyActivities?: any[]; // Actividades procesadas para el dashboard
}

export function useUserProfile() {
  const { data: session, status, update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      // Solo intentamos obtener el perfil si el usuario está autenticado
      if (status === "authenticated" && session) {
        try {
          setLoading(true);

          // Verificar que tenemos un token de acceso
          if (!session.accessToken) {
            console.error("No hay token de acceso en la sesión");
            setError(
              "No hay token de acceso, intente iniciar sesión nuevamente"
            );
            setProfile(null);
            setLoading(false);

            // Opcionalmente cerrar sesión si no hay token
            // await signOut({ redirect: false });
            return;
          }

          console.log(
            "Obteniendo perfil de usuario con token:",
            session.accessToken ? "Presente" : "Ausente"
          );

          // Intentar obtener el perfil
          const userData = await get<UserProfile>("users/dashboard-profile");

          if (userData) {
            // Verificar que las actividades de taxonomía estén presentes
            if (userData.taxonomyActivities) {
              console.log(
                `Actividades de taxonomía recibidas: ${userData.taxonomyActivities.length}`
              );
            } else {
              console.warn(
                "No se recibieron actividades de taxonomía en el perfil"
              );
            }

            setProfile(userData);
            setError(null);
            console.log(
              "Perfil de usuario obtenido correctamente:",
              userData.email
            );
          } else {
            throw new Error("No se pudo obtener el perfil del usuario");
          }
        } catch (err: any) {
          console.error("Error al obtener el perfil del usuario:", err);

          // Log detallado del error para diagnóstico
          if (err.data) {
            console.error("Detalles del error:", JSON.stringify(err.data));
          }

          // Si el error es 401, el token puede haber expirado
          if (err.status === 401) {
            console.warn("Sesión posiblemente expirada (401 Unauthorized)");
            setError(
              "La sesión ha expirado, intente iniciar sesión nuevamente"
            );

            // Intentar actualizar la sesión antes de cerrar
            try {
              await update();
            } catch (updateErr) {
              console.error("Error al actualizar la sesión:", updateErr);
            }
          } else if (err.status === 500) {
            setError(
              "Error interno del servidor. El equipo técnico ha sido notificado."
            );
          } else {
            setError(err.message || "Error al cargar el perfil");
          }

          setProfile(null);
        } finally {
          setLoading(false);
        }
      } else if (status === "unauthenticated") {
        // Si el usuario no está autenticado, reiniciamos el estado
        setProfile(null);
        setLoading(false);
        setError("Usuario no autenticado");
      }
    };

    // Llamamos a la función para obtener el perfil
    fetchProfile();
  }, [session, status, update]);

  return { profile, loading, error };
}
