# Solución al Problema de Autenticación

## Problema Identificado

El sistema de autenticación presentaba problemas debido a inconsistencias en el formato de almacenamiento de las contraseñas hasheadas:

1. Algunos hashes incluían un prefijo "bcrypt:" antes del hash real
2. Algunos hashes estaban en formato estándar de bcrypt (comenzando con "$2")
3. Existían hashes antiguos en formato SHA-256 (tanto con prefijo "sha256:" como sin él)

Estas inconsistencias causaban que los usuarios pudieran registrarse pero no iniciar sesión.

## Soluciones Implementadas

### 1. Modificación del servicio de autenticación (auth.service.ts)

- Se mejoró la detección y manejo de los diferentes formatos de hash
- Se añadió logging más detallado para diagnóstico
- Se aseguró que al iniciar sesión con un formato antiguo, se actualice automáticamente al formato correcto
- Se garantiza que los nuevos usuarios se registren siempre con el formato correcto (bcrypt sin prefijo)

### 2. Scripts de Diagnóstico y Corrección

Se crearon varios scripts para analizar y solucionar el problema:

- **fix-auth-issues.ts**: Prueba la funcionalidad básica de bcrypt y demuestra el problema con hashes prefijados
- **setup-test-user.ts**: Crea o actualiza un usuario de prueba con formato de hash correcto
- **normalize-password-hashes.ts**: Elimina prefijos de hashes en la base de datos
- **direct-normalize-hashes.ts**: Versión simplificada que no depende de NestJS
- **reset-user-password.ts**: Permite resetear la contraseña de un usuario específico
- **verify-authentication.ts**: Realiza un diagnóstico completo del sistema de autenticación

## Pasos para Implementar la Solución

1. **Verificar la funcionalidad de bcrypt**:

   ```
   cd apps/api && npx ts-node src/scripts/fix-auth-issues.ts
   ```

2. **Crear un usuario de prueba** (si la base de datos está vacía):

   ```
   cd apps/api && npx ts-node src/scripts/setup-test-user.ts
   ```

3. **Normalizar los hashes existentes** (si hay usuarios con hashes prefijados):

   ```
   cd apps/api && npx ts-node src/scripts/direct-normalize-hashes.ts
   ```

4. **Reiniciar el servidor de API**:

   ```
   cd apps/api && npm run start:dev
   ```

5. **Verificar que el inicio de sesión funciona** con las siguientes credenciales:
   - Email: `prueba@test.com`
   - Contraseña: `Contraseña123!`

## Cambios Permanentes

Los cambios implementados garantizan que:

1. Todos los hashes nuevos se almacenan en formato estándar bcrypt (sin prefijo)
2. Los hashes antiguos se normalizan automáticamente cuando el usuario inicia sesión
3. El servicio de autenticación maneja correctamente todas las variantes de formato

## Consideraciones Adicionales

Si persisten problemas de autenticación:

1. Verificar la configuración de la base de datos
2. Asegurarse que las credenciales y conexión a la base de datos son correctas
3. Usar el script `reset-user-password.ts` para forzar el reseteo de contraseñas problemáticas
