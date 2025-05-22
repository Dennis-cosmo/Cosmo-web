import NextAuth from "next-auth";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import z from "zod";

// Verificación de la configuración y URL robusta para el API
// Dentro del contenedor Docker, necesitamos usar el nombre del servicio
const API_URL = "http://api:4000";
console.log("URL de la API configurada para autenticación:", API_URL);

// Esquema de validación para las credenciales
const credentialsSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

// Definimos las opciones de autenticación
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        console.log("Inicio de authorize en [...nextauth]/route.ts");

        try {
          // Validamos las credenciales con zod
          const parsedCredentials = credentialsSchema.safeParse(credentials);

          if (!parsedCredentials.success) {
            console.error(
              "Error de validación de credenciales:",
              parsedCredentials.error
            );
            throw new Error("Credenciales inválidas");
          }

          const { email, password } = parsedCredentials.data;
          console.log(`Intentando autenticar usuario: ${email}`);
          console.log(`URL completa para autenticación: ${API_URL}/auth/login`);

          // Usamos global.fetch en lugar de importar node-fetch
          const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
          });

          if (!response.ok) {
            // Intentamos obtener el detalle del error
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } catch (e) {
              console.error("No se pudo parsear la respuesta de error:", e);
            }

            console.error("Error en la respuesta:", {
              status: response.status,
              statusText: response.statusText,
              message: errorMessage,
            });
            throw new Error(errorMessage);
          }

          const data = await response.json();

          if (!data || !data.accessToken || !data.user) {
            console.error("Datos de respuesta incompletos:", data);
            throw new Error("Respuesta del servidor incompleta");
          }

          console.log("Login exitoso:", {
            userId: data.user.id,
            email: data.user.email,
            tokenReceived: !!data.accessToken,
          });

          return {
            id: data.user.id,
            email: data.user.email,
            name: `${data.user.firstName} ${data.user.lastName}`,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            isAdmin: data.user.isAdmin,
            companyName: data.user.companyName,
            onboardingCompleted: data.user.onboardingCompleted,
            accessToken: data.accessToken,
          };
        } catch (error) {
          console.error("Error en la autenticación:", error);
          if (error instanceof Error) {
            throw new Error(error.message);
          }
          throw new Error("Error inesperado en la autenticación");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("jwt callback - user encontrado:", user.email);
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.isAdmin = user.isAdmin;
        token.companyName = user.companyName;
        token.onboardingCompleted = user.onboardingCompleted;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        console.log("session callback - token presente");

        // Asegurarnos de que el objeto session.user existe y tiene las propiedades necesarias
        if (!session.user) {
          session.user = {
            id: "",
            email: "",
            name: "",
            firstName: "",
            lastName: "",
            isAdmin: false,
            companyName: "",
            onboardingCompleted: false,
          };
        }

        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.companyName = token.companyName as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  // Prefijo de URL para las rutas de NextAuth
  basePath: "/api/auth",
  // Habilitar debugging solo en desarrollo
  debug: process.env.NODE_ENV === "development",
  // Usar el secreto configurado o uno por defecto
  secret:
    process.env.NEXTAUTH_SECRET || "desarrollo_nextauth_secret_key_cosmo_app",
};

// Exportar los handlers de NextAuth
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
