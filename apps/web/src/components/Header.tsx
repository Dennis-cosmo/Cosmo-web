"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button className="bg-transparent border border-grey-stone hover:border-lime-accent text-pure-white px-4 py-2 rounded-md transition-colors">
              Iniciar sesión
            </button>
            <button className="btn-primary">Registro</button>
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
            <div className="pt-4 flex flex-col space-y-2">
              <button className="bg-transparent border border-grey-stone hover:border-lime-accent text-pure-white px-4 py-2 rounded-md transition-colors w-full">
                Iniciar sesión
              </button>
              <button className="btn-primary w-full">Registro</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
