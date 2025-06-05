import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Extendemos los tipos de session.user
   */
  interface Session extends DefaultSession {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      name: string;
      firstName: string;
      lastName: string;
      isAdmin: boolean;
      companyName: string;
      onboardingCompleted: boolean;
    };
  }

  /**
   * Extendemos los tipos de user
   */
  interface User extends DefaultUser {
    id: string;
    email: string;
    name: string;
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
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    companyName: string;
    onboardingCompleted: boolean;
    accessToken: string;
  }
}
