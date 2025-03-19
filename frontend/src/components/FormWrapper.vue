<template>
  <div
    class="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-auto border border-gray-100"
  >
    <h2 class="text-2xl font-semibold text-gray-800 mb-6 text-center">
      {{ title }}
    </h2>
    <form @submit.prevent="$emit('submit')">
      <slot />
    </form>
  </div>
</template>

<script setup lang="ts">
interface FormWrapperProps {
  title: string;
}

defineProps<FormWrapperProps>();

defineEmits<{
  (e: "submit"): void;
}>();
</script>
