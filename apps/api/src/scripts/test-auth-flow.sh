#!/bin/bash

# Colores para los mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL de la API
API_URL="http://localhost:3001/api"

# Datos para prueba
EMAIL="test_user_$(date +%s)@example.com"
PASSWORD="Password123!"
FIRST_NAME="Usuario"
LAST_NAME="De Prueba"
COMPANY_NAME="Compañía Prueba"

echo -e "${YELLOW}Iniciando prueba del flujo de autenticación${NC}"
echo -e "Email de prueba: $EMAIL"
echo -e "Contraseña: $PASSWORD"
echo

# Paso 1: Registro de usuario
echo -e "${YELLOW}1. Registrando nuevo usuario...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"firstName\": \"$FIRST_NAME\",
    \"lastName\": \"$LAST_NAME\",
    \"companyName\": \"$COMPANY_NAME\",
    \"acceptTerms\": true
  }")

# Verificar si el registro fue exitoso
if [[ $REGISTER_RESPONSE == *"id"* ]]; then
  USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo -e "${GREEN}✅ Usuario registrado correctamente${NC}"
  echo -e "ID del usuario: $USER_ID"
else
  echo -e "${RED}❌ Error en el registro${NC}"
  echo -e "Respuesta: $REGISTER_RESPONSE"
  exit 1
fi

echo

# Paso 2: Iniciar sesión con el usuario creado
echo -e "${YELLOW}2. Iniciando sesión con el usuario registrado...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

# Verificar si el login fue exitoso
if [[ $LOGIN_RESPONSE == *"accessToken"* ]]; then
  ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
  echo -e "${GREEN}✅ Inicio de sesión exitoso${NC}"
  echo -e "Token recibido (primeros 20 caracteres): ${ACCESS_TOKEN:0:20}..."
else
  echo -e "${RED}❌ Error en el inicio de sesión${NC}"
  echo -e "Respuesta: $LOGIN_RESPONSE"
  exit 1
fi

echo

# Paso 3: Verificar el perfil con el token
echo -e "${YELLOW}3. Verificando acceso al perfil con el token...${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/auth/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

# Verificar si se pudo acceder al perfil
if [[ $PROFILE_RESPONSE == *"id"* ]] && [[ $PROFILE_RESPONSE == *"$EMAIL"* ]]; then
  echo -e "${GREEN}✅ Verificación de perfil exitosa${NC}"
else
  echo -e "${RED}❌ Error al acceder al perfil${NC}"
  echo -e "Respuesta: $PROFILE_RESPONSE"
  exit 1
fi

echo
echo -e "${GREEN}=== Prueba completa exitosa ===${NC}"
echo -e "El flujo de registro, inicio de sesión y acceso al perfil funciona correctamente."
echo -e "Puedes usar estas credenciales para iniciar sesión en la aplicación:"
echo -e "Email: $EMAIL"
echo -e "Contraseña: $PASSWORD" 