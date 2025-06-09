// Función para crear una ruta API pública sin autenticación
export function createPublicRoute(handler: Function) {
  return async function (req: any, res: any) {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error("Error en ruta pública:", error);
      return {
        status: 500,
        body: { error: "Error interno del servidor" },
      };
    }
  };
}
