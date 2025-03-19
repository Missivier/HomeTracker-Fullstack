<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="text-center p-8 bg-white rounded-lg shadow-sm">
      <svg class="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-gray-600">Redirection en cours...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  // Si l'utilisateur n'est pas connecté
  if (!authStore.token) {
    router.push('/auth/login');
    return;
  }
  
  // Si l'utilisateur a un token mais pas de profil, essayer de le récupérer
  if (!authStore.user) {
    try {
      const success = await authStore.fetchUserProfile();
      if (!success) {
        router.push('/auth/login');
        return;
      }
    } catch (error) {
      router.push('/auth/login');
      return;
    }
  }
  
  // Maintenant que l'utilisateur est authentifié, rediriger selon s'il a une maison
  if (authStore.user.houseId) {
    router.push('/dashboard');
  } else {
    router.push('/house/select');
  }
});
</script>
</template>