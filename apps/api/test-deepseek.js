console.log("Probando conexión con DeepSeek...");
       const axios = require("axios");
       
       async function testDeepSeek() {
         try {
           const response = await axios.post(
             "https://api.deepseek.com/v1/chat/completions",
             {
               model: "deepseek-chat",
               messages: [{ role: "user", content: "Hola, ¿cómo estás?" }],
               max_tokens: 100
             },
             {
               headers: {
                 "Content-Type": "application/json",
                 "Authorization": "Bearer sk-37d1eefa38d14d99a189768a5faf5d49"
               }
             }
           );
           
           console.log("Respuesta de DeepSeek:", response.data);
           return true;
         } catch (error) {
           console.error("Error al conectar con DeepSeek:", error.response ? error.response.data : error.message);
           return false;
         }
       }
       
       testDeepSeek().then(success => {
         if (success) {
           console.log("Conexión con DeepSeek correcta. Iniciando API...");
         } else {
           console.error("Fallo al conectar con DeepSeek. Revisar configuración pero continuando...");
         }
       });
