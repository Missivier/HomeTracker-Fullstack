<template>
  <div
    class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
  >
    <div class="sm:mx-auto sm:w-full sm:max-w-md mb-8">
      <h1 class="text-center text-3xl font-bold text-gray-900 mb-3">
        Auth Prototype
      </h1>
      <p class="text-center text-sm text-gray-600">
        <router-link
          to="/"
          class="text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
        >
          ← Retour à l'accueil
        </router-link>
      </p>
    </div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
// TypeScript setup
</script>
