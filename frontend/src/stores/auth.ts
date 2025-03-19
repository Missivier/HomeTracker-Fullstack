import type { User } from "@/types";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to login");
      }

      const data = await response.json();
      user.value = data.user;
      isAuthenticated.value = true;

      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    user.value = null;
    isAuthenticated.value = false;
  };

  const register = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to register");
      }

      const data = await response.json();
      user.value = data.user;
      isAuthenticated.value = true;

      return data;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "An error occurred";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
  };
});
