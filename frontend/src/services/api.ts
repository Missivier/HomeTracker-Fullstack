import router from "@/router";
import axios from "axios";

// URL de base de l'API
const API_URL = "http://localhost:3000/api";

// Type pour les éléments de la file d'attente
interface QueueItem {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}

// Création d'une instance Axios avec une configuration de base
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Timeout de 10s
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Pour envoyer et recevoir des cookies
});

// État pour suivre si nous sommes en train de rafraîchir le token
let isRefreshing = false;
// File d'attente pour les requêtes en attente pendant le rafraîchissement
let failedQueue: QueueItem[] = [];

// Fonction pour traiter la file d'attente
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Fonction pour déterminer si une URL est publique (ne nécessite pas d'authentification)
const isPublicUrl = (url: string) => {
  const publicUrls = [
    "/users/login",
    "/users/register",
    "/users/refresh-token",
  ];
  return publicUrls.some((publicUrl) => url.includes(publicUrl));
};

// Intercepteur pour ajouter le token à chaque requête (sauf les routes publiques)
api.interceptors.request.use(
  (config) => {
    // Ne pas ajouter de token pour les routes d'authentification
    if (isPublicUrl(config.url || "")) {
      // Supprimer temporairement l'en-tête Authorization pour les routes publiques
      delete config.headers.Authorization;
    } else {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour traiter les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est 401 (non autorisé) et ce n'est pas déjà une tentative de rafraîchissement
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isPublicUrl(originalRequest.url)
    ) {
      // Vérifier si le message indique un token expiré
      if (error.response.data.expired && !isRefreshing) {
        originalRequest._retry = true;
        isRefreshing = true;

        // Essayer de rafraîchir le token
        return new Promise((resolve, reject) => {
          api
            .post("/users/refresh-token")
            .then(({ data }) => {
              // Stocker le nouveau token
              localStorage.setItem("token", data.accessToken);

              // Mettre à jour l'en-tête Authorization
              api.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${data.accessToken}`;
              originalRequest.headers[
                "Authorization"
              ] = `Bearer ${data.accessToken}`;

              // Traiter la file d'attente
              processQueue(null, data.accessToken);

              // Résoudre avec la requête originale
              resolve(api(originalRequest));
            })
            .catch((refreshError) => {
              // Échec du rafraîchissement, rejeter toutes les requêtes
              processQueue(refreshError, null);

              // Gérer l'erreur de rafraîchissement (déconnexion)
              console.log("Échec du rafraîchissement du token, déconnexion");
              localStorage.removeItem("token");
              router.push("/auth/login");

              reject(refreshError);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      } else if (isRefreshing) {
        // Si nous sommes déjà en train de rafraîchir, ajouter la requête à la file d'attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Si ce n'est pas un problème de token expiré
      console.log("Session expirée ou non autorisé");
      if (!isPublicUrl(originalRequest.url)) {
        localStorage.removeItem("token");
        router.push("/auth/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
