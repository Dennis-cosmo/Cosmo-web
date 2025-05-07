# Configuración de Autenticación en Cosmo

## Variables de Entorno Necesarias

Asegúrate de tener las siguientes variables en tu archivo `.env`:

```
# Base
NODE_ENV=development

# Base de datos
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cosmo

# API
PORT=4000
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:4000

# Auth
JWT_SECRET=desarrollo_jwt_secret_key_cosmo_app
JWT_EXPIRATION=1d
NEXTAUTH_SECRET=desarrollo_nextauth_secret_key_cosmo_app
NEXTAUTH_URL=http://localhost:3000

# Rate limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Configuración de la Base de Datos

1. Asegúrate de tener PostgreSQL instalado y ejecutándose.
2. Crea una base de datos llamada `cosmo`:

```sql
CREATE DATABASE cosmo;
```

3. Ejecuta las migraciones:

```bash
cd packages/database
npm run migrate
```

## Estructura de la Autenticación

### Frontend (Next.js)

- Utilizamos NextAuth.js para la autenticación.
- Las rutas de autenticación están en `apps/web/src/app/api/auth/[...nextauth]/route.ts`.
- Las páginas de autenticación se encuentran en `apps/web/src/app/auth/`.
- Los componentes de formularios están en `apps/web/src/components/auth/`.
- Los tipos extendidos de NextAuth están en `apps/web/src/types/next-auth.d.ts`.

### Backend (NestJS)

- Utilizamos Passport.js con estrategias JWT y Local.
- El módulo de autenticación está en `apps/api/src/auth/`.
- Las estrategias de autenticación están en `apps/api/src/auth/strategies/`.
- Los guards de autenticación están en `apps/api/src/auth/guards/`.
- Las entidades de base de datos están en `packages/database/src/entities/`.

## Flujo de Autenticación

1. El usuario se registra en `/auth/register`.
2. Los datos se envían al backend en `POST /auth/register`.
3. El backend valida, hashea la contraseña y crea el usuario.
4. El usuario inicia sesión en `/auth/login`.
5. Los datos se envían a NextAuth que los valida contra el backend.
6. Si son válidos, se crea una sesión JWT y se redirige al dashboard.

## Endpoints de la API de Autenticación

- `POST /auth/register` - Registra un nuevo usuario
- `POST /auth/login` - Inicia sesión y devuelve un token JWT
- `GET /auth/profile` - Obtiene el perfil del usuario autenticado (requiere JWT)
