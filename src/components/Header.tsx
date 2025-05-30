"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    image: string;
  };
}

export default function Header({ user }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [gradientPosition, setGradientPosition] = useState(0);

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
              <h1 className="text-3xl font-normal tracking-tight text-eco-green drop-shadow-[0_0_15px_rgba(197,255,0,0.5)] transform transition-transform duration-300 hover:scale-110 flex items-center">
                Cosmo
              </h1>
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
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-white/90">
                Hello, {user?.name || "User"}
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
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium">
                        {user?.name?.charAt(0)}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
