# Solución al Problema de Login en Cosmo App

## Diagnóstico Realizado

Hemos realizado varias pruebas para diagnosticar el problema de inicio de sesión, y estas son nuestras conclusiones:

1. **Verificación de hash en la base de datos**:

   - El hash almacenado para el usuario de prueba (`prueba@test.com`) está en formato bcrypt estándar, sin el prefijo "bcrypt:".
   - Hash actual: `$2b$12$A1f52uyp80KEXOJ/T/8ZcOCzfueZlVGDZTo8h0v5..1STWJc/MQTC`

2. **Prueba directa con bcrypt**:

   - La contraseña "Contraseña123!" se valida correctamente con el hash almacenado.
   - El resultado de `bcrypt.compare()` devuelve `VÁLIDO`.

3. **Prueba directa al endpoint de API**:
   - La solicitud HTTP directa al endpoint `/auth/login` funciona correctamente.
   - Las credenciales (email: `prueba@test.com`, password: `Contraseña123!`) son aceptadas y se recibe un token JWT válido.

## Problema Identificado

El problema **NO está en el backend**, ya que la API de autenticación está funcionando correctamente. El problema probablemente está en:

1. **El frontend**: Puede haber un problema en cómo se envían las credenciales desde el formulario de login al backend.
2. **Problemas de red**: Podría haber problemas de CORS o de configuración de red que impiden que la solicitud llegue correctamente al servidor.
3. **Sesión de usuario**: Puede haber un problema con el manejo de la sesión en el navegador.

## Solución Propuesta

Para solucionar el problema, recomendamos verificar lo siguiente en el frontend:

1. **Verificar la solicitud HTTP en el frontend**:

   - Asegurarse que la URL del endpoint es correcta: `http://localhost:4000/auth/login` (o la URL correspondiente en producción).
   - Verificar que se está enviando el formato de datos correcto (JSON).
   - Comprobar que se están incluyendo los headers adecuados.

2. **Herramientas de desarrollo**:

   - Usar las herramientas de desarrollo del navegador (pestaña Network) para ver exactamente qué solicitud se está enviando y qué respuesta se está recibiendo.
   - Comparar con la solicitud exitosa que hemos realizado con nuestro script `test-login-api.ts`.

3. **Manejar caracteres especiales**:

   - Asegurarse que los caracteres especiales (como la "ñ" en "Contraseña") se están codificando correctamente.

4. **Gestión de sesión**:
   - Verificar que el token JWT recibido se está almacenando correctamente.
   - Comprobar que las solicitudes autenticadas incluyen el token correctamente.

## Credenciales de prueba

Estas credenciales han sido verificadas y funcionan correctamente:

- **Email**: `prueba@test.com`
- **Contraseña**: `Contraseña123!`

## Comando para probar directamente

Si deseas verificar nuevamente que el backend funciona correctamente, puedes usar este comando:

```bash
cd /Users/is/Desktop/cosmo-app/apps/api && npx ts-node src/scripts/test-login-api.ts
```
