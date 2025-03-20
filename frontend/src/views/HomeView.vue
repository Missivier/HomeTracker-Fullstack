<template>
  <div
    class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div
      class="max-w-md w-full space-y-8 text-center bg-white p-8 rounded-lg shadow-md border border-gray-100"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">HomeTracker</h1>
        <p class="text-gray-600 mb-8">
          Application de gestion de maison et de colocations
        </p>
      </div>

      <div v-if="loading">
        <div class="flex justify-center mb-4">
          <svg
            class="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <p class="text-gray-600">Vérification de la session...</p>
      </div>

      <div v-else-if="authStore.isAuthenticated">
        <p class="text-gray-600 mb-4">
          Vous êtes connecté en tant que
          <span class="font-medium">{{ authStore.userFullName }}</span>
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            @click="redirectToDashboard()"
            variant="primary"
            class="sm:w-40"
          >
            Accéder au compte
          </Button>

          <Button
            @click="authStore.logout()"
            variant="secondary"
            class="sm:w-40"
          >
            Déconnexion
          </Button>
        </div>
      </div>

      <div v-else class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          @click="router.push('/auth/login')"
          variant="primary"
          class="sm:w-40"
        >
          Connexion
        </Button>

        <Button
          @click="router.push('/auth/register')"
          variant="secondary"
          class="sm:w-40"
        >
          Inscription
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import Button from "../components/Button.vue";

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);

onMounted(async () => {
  // Si un token existe mais que l'utilisateur n'est pas chargé
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchUserProfile();
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
    }
  }
  loading.value = false;
});

const redirectToDashboard = () => {
  if (authStore.user?.houseId) {
    router.push("/dashboard");
  } else {
    router.push("/house/select");
  }
};
</script>
