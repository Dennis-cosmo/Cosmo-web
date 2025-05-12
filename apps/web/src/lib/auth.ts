import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Credenciales incompletas:", {
            email: !!credentials?.email,
            password: !!credentials?.password,
          });
          return null;
        }

        try {
          console.log(`Intentando login para: ${credentials.email}`);
          console.log(
            `URL de la API: ${process.env.NEXT_PUBLIC_API_URL}/auth/login`
          );

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Login failed:", {
              status: response.status,
              statusText: response.statusText,
              body: errorText,
            });
            return null;
          }

          const data = await response.json();
          console.log("Login exitoso:", {
            userId: data.user?.id,
            email: data.user?.email,
            tokenReceived: !!data.accessToken,
          });

          if (data && data.accessToken) {
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
          }

          console.error("Datos de respuesta incompletos:", data);
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
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
    signOut: "/",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
