import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extendemos los tipos de session.user
   */
  interface Session extends DefaultSession {
    accessToken: string;
    user: {
      id: string;
      isAdmin: boolean;
      firstName: string;
      lastName: string;
      companyName: string;
      onboardingCompleted: boolean;
    } & DefaultSession["user"];
  }

  /**
   * Extendemos los tipos de user
   */
  interface User extends DefaultUser {
    id: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    companyName: string;
    onboardingCompleted: boolean;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extendemos los tipos de token de JWT
   */
  interface JWT {
    id: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    companyName: string;
    onboardingCompleted: boolean;
    accessToken: string;
  }
}
