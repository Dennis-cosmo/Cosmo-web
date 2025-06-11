"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import React from "react";
import LogoPrincipal from "./logos/LogoPrincipal";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";
  const [scrolled, setScrolled] = useState(false);
  const [gradientPosition, setGradientPosition] = useState(0);

  // Evitar hidratación mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  // Actualiza la posición del gradiente periódicamente para crear un efecto de movimiento
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientPosition((prev) => (prev + 1) % 100);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Monitor scroll position for animation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Cerrar el menú del perfil al hacer clic fuera
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".profile-menu-container")) {
      setIsProfileMenuOpen(false);
    }
  };

  // Agregar y remover el event listener
  React.useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <header
      className={`relative bg-gradient-to-r from-cosmo-900 via-cosmo-800 to-cosmo-900 text-pure-white border-b border-eco-green/20 sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "shadow-lg shadow-eco-green/15 border-eco-green/25 after:opacity-100"
          : "after:opacity-0"
      } after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-eco-green/40 after:to-transparent after:transition-opacity after:duration-500`}
    >
      <div
        className="absolute inset-0 opacity-50 overflow-hidden"
        style={{
          background: `radial-gradient(circle at ${50 + Math.sin(gradientPosition * 0.05) * 30}% ${50 + Math.cos(gradientPosition * 0.05) * 20}%, rgba(87, 217, 163, 0.12) 0%, rgba(54, 179, 126, 0.07) 25%, transparent 50%)`,
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-eco-green/5 to-transparent"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <LogoPrincipal
                className="h-8 w-auto transform transition-transform duration-300 hover:scale-110"
                height={32}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 
                relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 
                after:bg-eco-green after:transform after:scale-x-0 after:origin-left 
                after:transition-transform after:duration-300 hover:after:scale-x-100
                hover:bg-eco-green/10 hover:drop-shadow-[0_0_8px_rgba(163,230,53,0.3)] ${
                  isActive("/")
                    ? "text-eco-green after:scale-x-100 bg-eco-green/5"
                    : "text-white/90 hover:text-eco-green"
                }`}
            >
              Home
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 
                    relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 
                    after:bg-eco-green after:transform after:scale-x-0 after:origin-left 
                    after:transition-transform after:duration-300 hover:after:scale-x-100
                    hover:bg-eco-green/10 hover:drop-shadow-[0_0_8px_rgba(163,230,53,0.3)] ${
                      isActive("/dashboard")
                        ? "text-eco-green after:scale-x-100 bg-eco-green/5"
                        : "text-white/90 hover:text-eco-green"
                    }`}
                >
                  Dashboard
                </Link>

                <Link
                  href="/expenses"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 
                    relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 
                    after:bg-eco-green after:transform after:scale-x-0 after:origin-left 
                    after:transition-transform after:duration-300 hover:after:scale-x-100
                    hover:bg-eco-green/10 hover:drop-shadow-[0_0_8px_rgba(163,230,53,0.3)] ${
                      isActive("/expenses")
                        ? "text-eco-green after:scale-x-100 bg-eco-green/5"
                        : "text-white/90 hover:text-eco-green"
                    }`}
                >
                  Expenses
                </Link>
                <Link
                  href="/reports"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 
                    relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 
                    after:bg-eco-green after:transform after:scale-x-0 after:origin-left 
                    after:transition-transform after:duration-300 hover:after:scale-x-100
                    hover:bg-eco-green/10 hover:drop-shadow-[0_0_8px_rgba(163,230,53,0.3)] ${
                      isActive("/reports")
                        ? "text-eco-green after:scale-x-100 bg-eco-green/5"
                        : "text-white/90 hover:text-eco-green"
                    }`}
                >
                  Reports
                </Link>
                <Link
                  href="/integrations"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 
                    relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 
                    after:bg-eco-green after:transform after:scale-x-0 after:origin-left 
                    after:transition-transform after:duration-300 hover:after:scale-x-100
                    hover:bg-eco-green/10 hover:drop-shadow-[0_0_8px_rgba(163,230,53,0.3)] ${
                      isActive("/integrations")
                        ? "text-eco-green after:scale-x-100 bg-eco-green/5"
                        : "text-white/90 hover:text-eco-green"
                    }`}
                >
                  Integrations
                </Link>
                <Link
                  href="/investors"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 
                    relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 
                    after:bg-eco-green after:transform after:scale-x-0 after:origin-left 
                    after:transition-transform after:duration-300 hover:after:scale-x-100
                    hover:bg-eco-green/10 hover:drop-shadow-[0_0_8px_rgba(163,230,53,0.3)] ${
                      isActive("/investors")
                        ? "text-eco-green after:scale-x-100 bg-eco-green/5"
                        : "text-white/90 hover:text-eco-green"
                    }`}
                >
                  Investors
                </Link>
              </>
            )}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {!mounted || isLoading ? (
              // Mostrar placeholder durante loading/hydration
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 animate-pulse rounded-md px-4 py-2 w-16 h-9"></div>
                <div className="bg-eco-green/20 animate-pulse rounded-md px-4 py-2 w-20 h-9"></div>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-white/90">
                  Hello, {session?.user?.firstName || "User"}
                </span>
                <div className="relative profile-menu-container">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-1 text-white/90 hover:text-eco-green transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-full bg-cosmo-400 flex items-center justify-center overflow-hidden
                        transform transition-all duration-300 hover:scale-110 hover:bg-eco-green"
                    >
                      {session?.user?.firstName && (
                        <span className="text-xs font-medium">
                          {session.user.firstName.charAt(0)}
                          {session.user.lastName?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 transition-transform duration-300 ${isProfileMenuOpen ? "rotate-180" : ""}`}
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
                  {isProfileMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-cosmo-400 rounded-md shadow-lg py-1 z-10 border border-white/10
                        animate-fadeIn"
                    >
                      <Link
                        href="/dashboard"
                        className={`block px-4 py-2 text-sm text-white/90 hover:bg-cosmo-300 transition-all duration-200 hover:pl-6 ${
                          isActive("/dashboard") ? "bg-cosmo-300" : ""
                        }`}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className={`block px-4 py-2 text-sm text-white/90 hover:bg-cosmo-300 transition-all duration-200 hover:pl-6 ${
                          isActive("/settings") ? "bg-cosmo-300" : ""
                        }`}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left block px-4 py-2 text-sm text-white/90 hover:bg-cosmo-300 transition-all duration-200 hover:pl-6"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="bg-transparent border border-white/20 hover:border-eco-green text-white/90 px-4 py-2 rounded-md transition-all duration-300 hover:text-eco-green hover:shadow-lg hover:shadow-eco-green/20"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-eco-green hover:bg-eco-green text-cosmo-500 px-4 py-2 rounded-md transition-all duration-300 font-medium hover:shadow-lg hover:shadow-eco-green/20 hover:-translate-y-1"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white/90 hover:text-eco-green transition-colors"
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
        <div className="md:hidden bg-cosmo-400 border-t border-white/10 animate-fadeIn">
          <div className="px-2 py-3 space-y-1">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive("/")
                  ? "text-eco-green"
                  : "text-white/90 hover:text-eco-green hover:bg-cosmo-300"
              }`}
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive("/dashboard")
                      ? "text-eco-green"
                      : "text-white/90 hover:text-eco-green hover:bg-cosmo-300"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/investors"
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive("/investors")
                      ? "text-eco-green"
                      : "text-white/90 hover:text-eco-green hover:bg-cosmo-300"
                  }`}
                >
                  Investors
                </Link>
                <Link
                  href="/expenses"
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive("/expenses")
                      ? "text-eco-green"
                      : "text-white/90 hover:text-eco-green hover:bg-cosmo-300"
                  }`}
                >
                  Expenses
                </Link>
                <Link
                  href="/reports"
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive("/reports")
                      ? "text-eco-green"
                      : "text-white/90 hover:text-eco-green hover:bg-cosmo-300"
                  }`}
                >
                  Reports
                </Link>
                <Link
                  href="/integrations"
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive("/integrations")
                      ? "text-eco-green"
                      : "text-white/90 hover:text-eco-green hover:bg-cosmo-300"
                  }`}
                >
                  Integrations
                </Link>
                <div className="pt-4 border-t border-white/10 mt-2">
                  <div className="block px-3 py-2 text-white/90">
                    <span>Hello, {session?.user?.firstName || "User"}</span>
                  </div>
                  <Link
                    href="/dashboard"
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive("/dashboard")
                        ? "text-eco-green"
                        : "text-white/90 hover:text-eco-green hover:bg-cosmo-300"
                    }`}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive("/settings")
                        ? "text-eco-green"
                        : "text-white/90 hover:text-eco-green hover:bg-cosmo-300"
                    }`}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:text-eco-green hover:bg-cosmo-300 transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 flex flex-col space-y-2">
                <Link
                  href="/auth/login"
                  className="bg-transparent border border-white/20 hover:border-eco-green text-white/90 px-4 py-2 rounded-md transition-all duration-300 hover:text-eco-green w-full text-center"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-eco-green hover:bg-eco-green text-cosmo-500 px-4 py-2 rounded-md transition-all duration-300 font-medium w-full text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
