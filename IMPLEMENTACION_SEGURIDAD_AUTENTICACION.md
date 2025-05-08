# Implementación de Seguridad en la Autenticación de Cosmo

## Resumen de Cambios

Hemos mejorado significativamente la seguridad del sistema de autenticación de Cosmo, implementando prácticas recomendadas para el almacenamiento de contraseñas y el manejo de credenciales de usuarios.

### Principales problemas abordados:

1. **Reemplazo de SHA-256** - Hemos eliminado el uso de algoritmos de hash criptográficos (SHA-256) para almacenar contraseñas, ya que estos no son adecuados para este propósito debido a:

   - Falta de "salt" aleatorio
   - Excesiva velocidad para hashing de contraseñas
   - Sin factor de trabajo ajustable
   - Vulnerabilidad a ataques con hardware especializado

2. **Implementación de algoritmos seguros** - Hemos implementado una solución que utiliza:

   - **bcryptjs** como algoritmo principal (JavaScript puro, compatible con Docker)
   - **argon2** como respaldo cuando está disponible (más seguro pero con dependencias nativas)

3. **Migración de datos existentes** - Hemos desarrollado scripts de migración para:
   - Migrar contraseñas almacenadas con SHA-256 a algoritmos seguros
   - Convertir hashes de argon2 a bcryptjs cuando sea necesario

## Detalles técnicos

### Algoritmos implementados:

#### bcryptjs

- **Ventajas**: Implementación pura de JavaScript, no requiere compilación nativa, ampliamente probado
- **Configuración**: 12 rondas (factor de trabajo)
- **Uso**: Método principal para todas las nuevas contraseñas

#### argon2

- **Ventajas**: Algoritmo ganador de la competencia Password Hashing Competition, resistente a ataques GPU/ASIC
- **Desventajas**: Requiere compilación nativa, problemas de compatibilidad en Docker
- **Configuración**:
  - Tipo: argon2id (híbrido, más seguro)
  - Costo de memoria: 16 MB
  - Factor de tiempo: 3 iteraciones
  - Paralelismo: 2 hilos
- **Uso**: Respaldo cuando bcryptjs falla

### Estrategia de migración

El sistema automáticamente migra las contraseñas antiguas a las nuevas cuando los usuarios inician sesión:

1. **Detección**: Se identifica el algoritmo utilizado por prefijos en el hash

   - SHA-256: `sha256:`
   - bcryptjs: `bcrypt:`
   - argon2: (sin prefijo)

2. **Actualización transparente**: Cuando un usuario inicia sesión con éxito usando un formato antiguo, se actualiza automáticamente al nuevo formato bcryptjs

3. **Script de migración**: Para migración proactiva sin requerir que los usuarios inicien sesión, ejecutar:
   ```
   npx ts-node -r tsconfig-paths/register src/scripts/migrate-to-bcryptjs.ts
   ```

## Recomendaciones Adicionales

1. **Política de contraseñas**:

   - Longitud mínima: 10 caracteres
   - Complejidad: incluir mayúsculas, minúsculas, números y símbolos
   - Verificación: comprobar contra bases de datos de contraseñas filtradas (como HaveIBeenPwned)

2. **Autenticación multifactor (MFA)**:

   - Implementar autenticación por email/SMS como segundo factor
   - Considerar la implementación de autenticación con aplicación (TOTP)

3. **Gestión de sesiones**:

   - Caducidad de tokens razonable (actualmente 1 día)
   - Opción para cerrar sesiones activas en otros dispositivos
   - Detección de actividad sospechosa y cierre automático de sesión

4. **Auditoría y monitoreo**:
   - Registrar intentos de inicio de sesión fallidos
   - Notificar al usuario sobre inicios de sesión desde nuevos dispositivos
   - Implementar bloqueo temporal después de múltiples intentos fallidos

## Anexo: Comprobación de la seguridad

Para comprobar que el sistema de autenticación está funcionando correctamente, se pueden utilizar las siguientes herramientas:

1. **Inspección de hash en la base de datos**:

   - Los hashes de contraseñas deben comenzar con `bcrypt:` o ser hashes de argon2
   - No debe haber hashes SHA-256 excepto como medida temporal

2. **Análisis de vulnerabilidades**:

   - Ejecutar análisis estático del código
   - Realizar pruebas de penetración en los endpoints de autenticación

3. **Monitoreo de rendimiento**:
   - El proceso de verificación debe tardar entre 250ms-500ms para un balance óptimo entre seguridad y experiencia de usuario
