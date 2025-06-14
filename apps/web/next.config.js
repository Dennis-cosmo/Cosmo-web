/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Configuración de variables de entorno
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXTAUTH_URL:
      process.env.NEXTAUTH_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.NEXTAUTH_URL),
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },

  // Transpilación de paquetes del monorepo
  transpilePackages: ["@cosmo/shared"],

  // Configuración de salida SOLO para producción real (Railway/Hetzner)
  output:
    process.env.DEPLOYMENT_ENV === "production" ? "standalone" : undefined,

  // Configuración de rewrite para redirigir peticiones /api a la API real
  async rewrites() {
    // En desarrollo Docker, usamos nombres de contenedores
    const apiUrl =
      process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_API_URL || "http://api:4000"
        : process.env.NEXT_PUBLIC_API_URL ||
          process.env.API_URL ||
          "http://api:4000";

    console.log("URL de la API configurada:", apiUrl);

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

  // Configuración de imágenes
  images: {
    domains: ["localhost"],
    unoptimized: process.env.NODE_ENV === "development",
  },

  // Configuración experimental para desarrollo
  experimental: {
    // Mejorar hot reload en desarrollo
    ...(process.env.NODE_ENV === "development" && {
      optimizePackageImports: ["@cosmo/shared"],
    }),
  },

  // Configuración específica para desarrollo que previene problemas SSR
  ...(process.env.NODE_ENV === "development" && {
    swcMinify: false,
    poweredByHeader: false,
  }),
};

module.exports = nextConfig;
