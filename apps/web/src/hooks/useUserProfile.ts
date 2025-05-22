import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { get } from "../lib/api";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  euTaxonomySectorIds?: number[];
  euTaxonomySectorNames?: string[];
  euTaxonomyActivities?: any[];
  taxonomyActivities?: any[]; // Actividades procesadas para el dashboard
}

export function useUserProfile() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      // Solo intentamos obtener el perfil si el usuario está autenticado
      if (status === "authenticated" && session) {
        try {
          setLoading(true);
          const userData = await get<UserProfile>("users/dashboard-profile");
          setProfile(userData);
          setError(null);
        } catch (err: any) {
          console.error("Error al obtener el perfil del usuario:", err);
          setError(err.message || "Error al cargar el perfil");
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
  }, [session, status]);

  return { profile, loading, error };
}
