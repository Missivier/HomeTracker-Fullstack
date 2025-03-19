import router from "@/router";
import api from "@/services/api";
import { defineStore } from "pinia";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  phone?: string;
  description?: string;
  roleId: number;
  role?: {
    name: string;
  };
  houseId?: number;
  house?: {
    id: number;
    name: string;
    address?: string;
  };
}

interface UserRegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  username?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  description?: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem("token") || null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userFullName: (state) => {
      if (!state.user) return "";
      return `${state.user.firstName} ${state.user.lastName}`;
    },
    hasHouse: (state) => !!state.user?.houseId,
  },

  actions: {
    async register(userData: UserRegisterData): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post("/users/register", userData);
        return true;
      } catch (error: any) {
        console.error("Erreur d'inscription:", error);
        if (error.response && error.response.data) {
          this.error =
            error.response.data.message || "Erreur lors de l'inscription";
        } else {
          this.error = "Erreur de connexion au serveur";
        }
        return false;
      } finally {
        this.loading = false;
      }
    },

    async login(email: string, password: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post("/users/login", {
          email,
          password,
        });

        this.user = response.data.user;
        this.token = response.data.token;

        // Stocker le token dans le localStorage
        localStorage.setItem("token", response.data.token);

        return true;
      } catch (error: any) {
        console.error("Erreur de connexion:", error);
        if (error.response && error.response.data) {
          this.error = error.response.data.message || "Identifiants incorrects";
        } else {
          this.error = "Erreur de connexion au serveur";
        }
        return false;
      } finally {
        this.loading = false;
      }
    },

    async fetchUserProfile(): Promise<boolean> {
      if (!this.token) return false;

      this.loading = true;

      try {
        const response = await api.get("/users/profile");
        this.user = response.data;
        return true;
      } catch (error: any) {
        console.error("Erreur de récupération du profil:", error);
        if (error.response && error.response.status === 401) {
          // Token expiré ou invalide
          this.logout();
        }
        return false;
      } finally {
        this.loading = false;
      }
    },

    // Méthode pour rediriger l'utilisateur en fonction de son état d'authentification
    async handleAuthRedirect() {
      // Si l'utilisateur n'est pas connecté
      if (!this.token) {
        router.push("/auth/login");
        return;
      }

      // Si l'utilisateur a un token mais pas de profil, essayer de le récupérer
      if (this.token && !this.user) {
        try {
          const success = await this.fetchUserProfile();
          if (!success) {
            router.push("/auth/login");
            return;
          }
        } catch (error) {
          router.push("/auth/login");
          return;
        }
      }

      // Rediriger selon que l'utilisateur a une maison ou non
      if (this.user?.houseId) {
        router.push("/dashboard");
      } else {
        router.push("/house/select");
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
      router.push("/auth/login");
    },
  },
});
