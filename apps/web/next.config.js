/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Configuración de variables de entorno
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },

  // Transpilación de paquetes del monorepo
  transpilePackages: ["@cosmo/shared"],

  // Configuración de salida para Railway
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  // Configuración de rewrite para redirigir peticiones /api a la API real
  async rewrites() {
    // En Railway, usamos variables de entorno dinámicas
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.API_URL ||
      "http://api:4000";

    return [
      // Excluimos las rutas de NextAuth de la redirección
      {
        source: "/api/auth/:path*",
        destination: "/api/auth/:path*",
      },
      // Redirigimos el resto de las peticiones /api a la API real
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },

  // Configuración de headers para permitir CORS
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  // Configuración de imágenes para Railway
  images: {
    domains: ["localhost"],
    unoptimized: process.env.NODE_ENV === "production",
  },

  // Configuración experimental para mejorar performance
  experimental: {
    // appDir is deprecated in Next.js 14 and enabled by default
  },
};

module.exports = nextConfig;
