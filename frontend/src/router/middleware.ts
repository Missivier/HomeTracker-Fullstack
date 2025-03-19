import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "../stores/auth";

/**
 * Middleware pour vérifier si l'utilisateur est authentifié
 */
export const requireAuth = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();

  // Si l'utilisateur n'est pas authentifié (pas de token), rediriger vers la connexion
  if (!authStore.token) {
    return next({ name: "login" });
  }

  // Si l'utilisateur a un token mais pas de profil chargé, essayer de charger son profil
  if (authStore.token && !authStore.user) {
    try {
      const success = await authStore.fetchUserProfile();
      if (!success) {
        // Si échec de récupération du profil (token invalide/expiré), rediriger vers la connexion
        authStore.logout();
        return next({ name: "login" });
      }
    } catch (error) {
      authStore.logout();
      return next({ name: "login" });
    }
  }

  // L'utilisateur est authentifié, continuer
  next();
};

/**
 * Middleware pour vérifier si l'utilisateur n'est pas encore affilié à une maison
 */
export const requireNoHouse = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();

  // D'abord vérifier que l'utilisateur est authentifié
  if (!authStore.token) {
    return next({ name: "login" });
  }

  // Charger le profil si nécessaire
  if (!authStore.user) {
    try {
      const success = await authStore.fetchUserProfile();
      if (!success) {
        authStore.logout();
        return next({ name: "login" });
      }
    } catch (error) {
      authStore.logout();
      return next({ name: "login" });
    }
  }

  // Si l'utilisateur a déjà une maison, rediriger vers le dashboard
  if (authStore.user?.houseId) {
    return next({ name: "dashboard" });
  }

  // L'utilisateur n'a pas de maison, continuer
  next();
};

/**
 * Middleware pour vérifier si l'utilisateur est affilié à une maison
 */
export const requireHouse = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();

  // D'abord vérifier que l'utilisateur est authentifié
  if (!authStore.token) {
    return next({ name: "login" });
  }

  // Charger le profil si nécessaire
  if (!authStore.user) {
    try {
      const success = await authStore.fetchUserProfile();
      if (!success) {
        authStore.logout();
        return next({ name: "login" });
      }
    } catch (error) {
      authStore.logout();
      return next({ name: "login" });
    }
  }

  // Si l'utilisateur n'a pas de maison, rediriger vers la sélection de maison
  if (!authStore.user?.houseId) {
    return next({ name: "houseSelect" });
  }

  // L'utilisateur a une maison, continuer
  next();
};

/**
 * Middleware pour rediriger les utilisateurs authentifiés loin de la page de connexion/inscription
 */
export const redirectIfAuthenticated = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();

  // Si l'utilisateur a un token, essayer de vérifier son profil
  if (authStore.token) {
    if (!authStore.user) {
      try {
        const success = await authStore.fetchUserProfile();
        if (!success) {
          // Si échec de récupération du profil, laisser accéder à la page de connexion
          return next();
        }
      } catch (error) {
        return next();
      }
    }

    // Si l'utilisateur est connecté
    if (authStore.user) {
      // Rediriger selon qu'il a une maison ou non
      if (authStore.user.houseId) {
        return next({ name: "dashboard" });
      } else {
        return next({ name: "houseSelect" });
      }
    }
  }

  // Pas d'authentification, continuer normalement
  next();
};
