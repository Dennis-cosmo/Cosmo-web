# Configuración de proveedores de IA

Este proyecto soporta múltiples proveedores de IA a través de una arquitectura modular. Actualmente se admiten OpenAI y DeepSeek.

## Variables de entorno

Para configurar los proveedores de IA, añade las siguientes variables a tu archivo `.env`:

```
# OpenAI
OPENAI_API_KEY="your-openai-api-key-here"
OPENAI_MODEL="gpt-4o"
OPENAI_MAX_TOKENS=2000

# DeepSeek
DEEPSEEK_API_KEY="your-deepseek-api-key-here"
DEEPSEEK_MODEL="deepseek-chat"
DEEPSEEK_MAX_TOKENS=2000

# Proveedor de IA por defecto (openai o deepseek)
DEFAULT_AI_PROVIDER="openai"
```

## Obtención de claves API

### OpenAI

1. Crea una cuenta en [OpenAI](https://platform.openai.com/)
2. Ve a la sección de API Keys
3. Crea una nueva clave API
4. Copia la clave en tu archivo `.env`

### DeepSeek

1. Crea una cuenta en [DeepSeek Platform](https://platform.deepseek.com/)
2. Ve a la sección API Keys
3. Crea una nueva clave API
4. Copia la clave en tu archivo `.env`

## Uso de proveedores

### Cambiar el proveedor predeterminado

Modifica la variable `DEFAULT_AI_PROVIDER` en tu archivo `.env` con el valor "openai" o "deepseek".

### Seleccionar proveedor para una solicitud específica

Puedes especificar el proveedor para cada solicitud usando el parámetro `providerType` en el método `processWithAI`:

```typescript
// Usando OpenAI
const resultOpenAI = await aiService.processWithAI(
  data,
  prompt,
  options,
  "openai"
);

// Usando DeepSeek
const resultDeepSeek = await aiService.processWithAI(
  data,
  prompt,
  options,
  "deepseek"
);
```

## Probando los proveedores

Puedes probar los diferentes proveedores usando los siguientes endpoints:

- **GET /ai/providers**: Muestra los proveedores disponibles
- **GET /ai/test?provider=openai**: Prueba el proveedor OpenAI
- **GET /ai/test?provider=deepseek**: Prueba el proveedor DeepSeek
- **GET /ai/test?provider=mock**: Devuelve una respuesta simulada (sin hacer llamadas API)
