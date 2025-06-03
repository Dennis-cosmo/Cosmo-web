#!/bin/bash

# Configurar variables para Railway Web Service
railway variables set NODE_ENV=production
railway variables set NEXTAUTH_URL=$RAILWAY_STATIC_URL
railway variables set NEXT_PUBLIC_API_URL=$API_SERVICE_RAILWAY_URL

# QuickBooks Production para Railway
railway variables set QUICKBOOKS_CLIENT_ID=$QUICKBOOKS_PROD_CLIENT_ID
railway variables set QUICKBOOKS_CLIENT_SECRET=$QUICKBOOKS_PROD_CLIENT_SECRET
railway variables set QUICKBOOKS_REDIRECT_URI="$RAILWAY_STATIC_URL/api/integrations/quickbooks/callback"
railway variables set QUICKBOOKS_ENVIRONMENT=production

# Desplegar
railway up 

# Verificar estructura de archivos .env
ls -la .env*
ls -la apps/web/.env*
ls -la apps/api/.env* 