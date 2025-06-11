# --- Build Stage ---
    FROM node:18-alpine AS builder

    WORKDIR /app
    
    # Copiar solo los archivos esenciales primero (mejor cacheo)
    COPY package.json yarn.lock turbo.json ./
    
    # Copiar los package.json de los workspaces para las dependencias
    COPY packages/shared/package.json packages/shared/package.json
    COPY packages/ui/package.json packages/ui/package.json
    COPY packages/database/package.json packages/database/package.json
    COPY packages/connectors/package.json packages/connectors/package.json
    COPY apps/web/package.json apps/web/package.json
    
    # Instalación de dependencias
    RUN yarn install --frozen-lockfile
    
    # Copiar el resto del código (fuentes)
    COPY . .
    
    # Compilar la app web
    RUN yarn workspace @cosmo/web build
    
    # --- Production Stage ---
    FROM node:18-alpine AS runner
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    # Copiamos solo lo necesario para producción
    COPY --from=builder /app/apps/web/.next /app/apps/web/.next
    COPY --from=builder /app/apps/web/public /app/apps/web/public
    COPY --from=builder /app/apps/web/package.json /app/apps/web/package.json
    
    # Copiamos los node_modules generales
    COPY --from=builder /app/node_modules /app/node_modules
    
    # Copiamos también package.json raíz (por si es requerido)
    COPY --from=builder /app/package.json /app/package.json
    
    # Exponemos el puerto
    EXPOSE 3000
    
    # Comando de inicio
    CMD ["yarn", "workspace", "@cosmo/web", "start"]
    