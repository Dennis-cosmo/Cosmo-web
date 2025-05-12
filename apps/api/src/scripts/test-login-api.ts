import axios, { AxiosError } from "axios";

/**
 * Script para probar el endpoint de login directamente mediante una solicitud HTTP
 */
async function testLoginApi() {
  console.log("=== Prueba de Login API ===");

  const apiUrl = "http://localhost:4000/auth/login";
  const credentials = {
    email: "prueba@test.com",
    password: "Contraseña123!",
  };

  console.log(`Endpoint: ${apiUrl}`);
  console.log(`Credentials: ${JSON.stringify(credentials, null, 2)}`);

  try {
    console.log("\nEnviando solicitud de login...");
    const response = await axios.post(apiUrl, credentials);

    console.log(`\n✅ Login exitoso (status ${response.status})!`);
    console.log("Respuesta:");
    console.log(`- Token: ${response.data.accessToken?.substring(0, 20)}...`);
    console.log(`- Usuario: ${response.data.user?.email}`);
    console.log(`- ID: ${response.data.user?.id}`);
  } catch (error) {
    console.error("\n❌ Error al hacer login:");

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      // La solicitud fue realizada y el servidor respondió con un código de estado fuera del rango 2xx
      if (axiosError.response) {
        console.error(`Status: ${axiosError.response.status}`);
        console.error(
          `Mensaje: ${JSON.stringify(axiosError.response.data, null, 2)}`
        );

        // Si es un error de credenciales, probar con variaciones
        if (axiosError.response.status === 401) {
          console.log("\n🔍 Probando con variaciones de contraseña:");

          // Variación 1: sin acentos
          const noAccentPassword = credentials.password
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          if (noAccentPassword !== credentials.password) {
            console.log(`\n1. Probando sin acentos: "${noAccentPassword}"`);
            try {
              const resp = await axios.post(apiUrl, {
                email: credentials.email,
                password: noAccentPassword,
              });
              console.log(
                `✅ Login exitoso con esta variación! (status ${resp.status})`
              );
            } catch (err) {
              console.log("❌ Esta variación también falló");
            }
          }

          // Variación 2: sin caracteres especiales
          const noSpecialChars = credentials.password.replace(
            /[ñÑáéíóúÁÉÍÓÚ]/g,
            (char) => {
              const replacements: Record<string, string> = {
                ñ: "n",
                Ñ: "N",
                á: "a",
                é: "e",
                í: "i",
                ó: "o",
                ú: "u",
                Á: "A",
                É: "E",
                Í: "I",
                Ó: "O",
                Ú: "U",
              };
              return replacements[char] || char;
            }
          );

          if (
            noSpecialChars !== credentials.password &&
            noSpecialChars !== noAccentPassword
          ) {
            console.log(
              `\n2. Probando sin caracteres especiales: "${noSpecialChars}"`
            );
            try {
              const resp = await axios.post(apiUrl, {
                email: credentials.email,
                password: noSpecialChars,
              });
              console.log(
                `✅ Login exitoso con esta variación! (status ${resp.status})`
              );
            } catch (err) {
              console.log("❌ Esta variación también falló");
            }
          }
        }
      } else if (axiosError.request) {
        // La solicitud fue realizada pero no se recibió respuesta
        console.error(
          "No se recibió respuesta del servidor. Verifica que la API esté en ejecución."
        );
      } else {
        // Error al configurar la solicitud
        console.error(`Error: ${axiosError.message}`);
      }
    } else {
      console.error(
        `Error general: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

// Ejecutar prueba
testLoginApi()
  .then(() => console.log("\nPrueba completada."))
  .catch((error) =>
    console.error(
      "Error fatal:",
      error instanceof Error ? error.message : String(error)
    )
  );
