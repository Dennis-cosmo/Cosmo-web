"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <header className="bg-deep-space text-pure-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <div className="w-10 h-10 rounded-full bg-eco-green flex items-center justify-center mr-2">
              <span className="font-bold text-pure-white">C</span>
            </div>
            <span className="font-bold text-xl">Cosmo</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4">
            <Link href="/" className="nav-link-active">
              Inicio
            </Link>

            {isAuthenticated && (
              <>
                <Link href="/dashboard" className="nav-link">
                  Dashboard
                </Link>
                <Link href="/expenses" className="nav-link">
                  Gastos
                </Link>
                <Link href="/reports" className="nav-link">
                  Reportes
                </Link>
                <Link href="/integrations" className="nav-link">
                  Integraciones
                </Link>
              </>
            )}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm">
                  Hola, {session?.user?.firstName || "Usuario"}
                </span>
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-pure-white hover:text-lime-accent">
                    <div className="w-8 h-8 rounded-full bg-grey-stone flex items-center justify-center overflow-hidden">
                      {session?.user?.firstName && (
                        <span className="text-xs font-medium">
                          {session.user.firstName.charAt(0)}
                          {session.user.lastName?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-cosmo-800 rounded-md shadow-lg py-1 hidden group-hover:block z-10">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-pure-white hover:bg-gray-100 dark:hover:bg-cosmo-700"
                    >
                      Perfil
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-pure-white hover:bg-gray-100 dark:hover:bg-cosmo-700"
                    >
                      Configuración
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-pure-white hover:bg-gray-100 dark:hover:bg-cosmo-700"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="bg-transparent border border-grey-stone hover:border-lime-accent text-pure-white px-4 py-2 rounded-md transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link href="/auth/register" className="btn-primary">
                  Registro
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-pure-white hover:text-lime-accent"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-deep-space border-t border-grey-stone/20">
          <div className="px-2 py-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 text-lime-accent font-medium"
            >
              Inicio
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-pure-white hover:text-lime-accent"
                >
                  Dashboard
                </Link>
                <Link
                  href="/expenses"
                  className="block px-3 py-2 text-pure-white hover:text-lime-accent"
                >
                  Gastos
                </Link>
                <Link
                  href="/reports"
                  className="block px-3 py-2 text-pure-white hover:text-lime-accent"
                >
                  Reportes
                </Link>
                <Link
                  href="/integrations"
                  className="block px-3 py-2 text-pure-white hover:text-lime-accent"
                >
                  Integraciones
                </Link>
                <div className="pt-4 border-t border-grey-stone/20 mt-2">
                  <div className="block px-3 py-2 text-pure-white">
                    <span>Hola, {session?.user?.firstName || "Usuario"}</span>
                  </div>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-pure-white hover:text-lime-accent"
                  >
                    Perfil
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-3 py-2 text-pure-white hover:text-lime-accent"
                  >
                    Configuración
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="block w-full text-left px-3 py-2 text-pure-white hover:text-lime-accent"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 flex flex-col space-y-2">
                <Link
                  href="/auth/login"
                  className="bg-transparent border border-grey-stone hover:border-lime-accent text-pure-white px-4 py-2 rounded-md transition-colors w-full text-center"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary w-full text-center"
                >
                  Registro
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
