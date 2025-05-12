const fetch = require("node-fetch");

// Configuración
const API_URL = process.env.API_URL || "http://localhost:3001";
const EMAIL = process.argv[2] || "prueba@test.com";
const PASSWORD = process.argv[3] || "Contraseña123!";

async function testAuth() {
  console.log(`Probando autenticación para usuario: ${EMAIL}`);
  console.log("---------------------------------------------");

  try {
    // Realizar petición de login
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
      }),
    });

    // Procesar respuesta
    const data = await response.text();
    let jsonData = null;

    try {
      jsonData = JSON.parse(data);
    } catch (e) {
      // No es JSON válido, mantener como texto
    }

    // Mostrar resultados
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log("Headers:", response.headers.raw());
    console.log("Cuerpo de la respuesta:");
    console.log(jsonData || data);

    // Evaluar resultado
    if (response.ok) {
      console.log("\n✅ Autenticación exitosa");
      if (jsonData && jsonData.accessToken) {
        console.log("Token JWT recibido correctamente");
        console.log("Usuario autenticado:", jsonData.user.email);
      }
    } else {
      console.log("\n❌ Autenticación fallida");
    }
  } catch (error) {
    console.error("\n❌ Error en la petición:", error.message);
  }
}

// Ejecutar la prueba
testAuth().catch(console.error);
