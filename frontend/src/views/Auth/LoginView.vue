<template>
  <FormWrapper title="Connexion" @submit="handleSubmit">
    <Input
      id="email"
      v-model="email"
      label="Email"
      type="email"
      placeholder="votre@email.com"
      required
    />

    <Input
      id="password"
      v-model="password"
      label="Mot de passe"
      type="password"
      placeholder="••••••••"
      required
    />

    <p v-if="authStore.error" class="text-red-600 text-sm mb-6 text-center">
      {{ authStore.error }}
    </p>

    <div class="mt-8">
      <Button
        type="submit"
        variant="primary"
        :loading="authStore.loading"
        full-width
      >
        Se connecter
      </Button>
    </div>

    <div class="mt-6 text-center text-sm">
      <span class="text-gray-600">Pas encore de compte?</span>
      <router-link
        to="/auth/register"
        class="ml-1 text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
      >
        S'inscrire
      </router-link>
    </div>
  </FormWrapper>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import FormWrapper from "../../components/FormWrapper.vue";
import Input from "../../components/Input.vue";
import Button from "../../components/Button.vue";

const router = useRouter();
const authStore = useAuthStore();

const email = ref<string>("");
const password = ref<string>("");

const handleSubmit = async (): Promise<void> => {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push("/");
  }
};
</script>
