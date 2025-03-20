<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center"
      >
        <div class="flex items-center">
          <h1 class="text-xl font-semibold text-gray-800">HomeTracker</h1>
        </div>

        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">{{
            authStore.userFullName
          }}</span>
          <button
            @click="authStore.logout()"
            class="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="flex-grow">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
</script>
