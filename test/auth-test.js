// Enregistrez ce fichier et exécutez-le avec Node.js
// node auth-test.js
const http = require("http");

// Configurations
const apiUrl = "localhost";
const apiPort = 3000;

// Données de test
const loginData = {
  email: "test@example.com",
  password: "password123",
};

// Fonction pour envoyer une requête HTTP
function sendRequest(path, method, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: apiUrl,
      port: apiPort,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        try {
          const parsedData = responseBody ? JSON.parse(responseBody) : {};
          console.log("RESPONSE BODY:", parsedData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedData,
          });
        } catch (e) {
          console.error("Error parsing response:", e);
          console.log("Raw response:", responseBody);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseBody,
          });
        }
      });
    });

    req.on("error", (e) => {
      console.error(`Request error: ${e.message}`);
      reject(e);
    });

    if (data) {
      const postData = JSON.stringify(data);
      req.write(postData);
    }

    req.end();
  });
}

// Fonction principale d'exécution des tests
async function runTests() {
  console.log("\n=== TEST DE L'API D'AUTHENTIFICATION ===\n");

  console.log("1. Test de la route de connexion:");
  try {
    const loginResult = await sendRequest(
      "/api/users/login",
      "POST",
      loginData
    );

    if (loginResult.statusCode === 200) {
      console.log("\n✅ CONNEXION RÉUSSIE\n");

      // Si la connexion réussit, essayez d'accéder à une route protégée
      const token = loginResult.body.token;
      console.log("\n2. Test d'accès à une route protégée avec le token:");

      const profileResult = await sendRequest(
        "/api/users/profile",
        "GET",
        null,
        token
      );

      if (profileResult.statusCode === 200) {
        console.log("\n✅ ACCÈS AU PROFIL RÉUSSI\n");
      } else {
        console.log("\n❌ ÉCHEC DE L'ACCÈS AU PROFIL\n");
      }
    } else {
      console.log("\n❌ ÉCHEC DE CONNEXION\n");
    }
  } catch (error) {
    console.error("Erreur lors des tests:", error);
  }
}

// Exécution des tests
runTests();
