import axios from "axios";
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
    id: number;
    name: string;
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
  },

  actions: {
    async register(userData: UserRegisterData): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.post("/api/users/register", userData);

        // Optionnellement, connecter automatiquement l'utilisateur après l'inscription
        // this.user = response.data.user;
        // this.token = response.data.token;
        // localStorage.setItem('token', response.data.token);

        return true;
      } catch (error: any) {
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
        const response = await axios.post("/api/users/login", {
          email,
          password,
        });

        this.user = response.data.user;
        this.token = response.data.token;

        // Stocker le token dans le localStorage
        localStorage.setItem("token", response.data.token);

        // Configurer l'en-tête d'autorisation pour les futures requêtes
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;

        return true;
      } catch (error: any) {
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
        // Configurer l'en-tête d'autorisation
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;

        const response = await axios.get("/api/users/profile");
        this.user = response.data;
        return true;
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          // Token expiré ou invalide
          this.logout();
        }
        return false;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    },
  },
});
