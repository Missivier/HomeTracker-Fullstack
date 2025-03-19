<template>
  <button
    :class="[
      'px-5 py-2.5 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm',
      variant === 'primary'
        ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 hover:shadow-md'
        : '',
      variant === 'secondary'
        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 hover:shadow-md'
        : '',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      fullWidth ? 'w-full' : '',
      className,
    ]"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-center">
      <svg
        v-if="loading"
        class="animate-spin -ml-1 mr-2 h-4 w-4"
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
      <slot />
    </div>
  </button>
</template>

<script setup lang="ts">
interface ButtonProps {
  variant?: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

defineProps<ButtonProps>();

defineEmits<{
  (e: "click"): void;
}>();
</script>
