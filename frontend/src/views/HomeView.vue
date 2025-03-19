<template>
  <div
    class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div
      class="max-w-md w-full space-y-8 text-center bg-white p-8 rounded-lg shadow-md border border-gray-100"
    >
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Auth Prototype</h1>
        <p class="text-gray-600 mb-8">
          Simple prototype pour tester l'authentification avec Vue.js et Express
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
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
import { useRouter } from "vue-router";
import Button from "../components/Button.vue";

const router = useRouter();
</script>
