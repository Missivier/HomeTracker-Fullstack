<template>
  <FormWrapper title="Inscription" @submit="handleSubmit">
    <Input
      id="name"
      v-model="name"
      label="Nom"
      type="text"
      placeholder="Votre nom"
      required
    />

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

    <Input
      id="confirmPassword"
      v-model="confirmPassword"
      label="Confirmer le mot de passe"
      type="password"
      placeholder="••••••••"
      required
      :error="passwordError"
    />

    <p v-if="authStore.error" class="text-red-600 text-sm mb-6 text-center">
      {{ authStore.error }}
    </p>

    <div class="mt-8">
      <Button
        type="submit"
        variant="primary"
        :loading="authStore.loading"
        :disabled="!isFormValid"
        full-width
      >
        S'inscrire
      </Button>
    </div>

    <div class="mt-6 text-center text-sm">
      <span class="text-gray-600">Déjà un compte?</span>
      <router-link
        to="/auth/login"
        class="ml-1 text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
      >
        Se connecter
      </router-link>
    </div>
  </FormWrapper>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import FormWrapper from "../../components/FormWrapper.vue";
import Input from "../../components/Input.vue";
import Button from "../../components/Button.vue";

const router = useRouter();
const authStore = useAuthStore();

const name = ref<string>("");
const email = ref<string>("");
const password = ref<string>("");
const confirmPassword = ref<string>("");

const passwordError = computed<string>(() => {
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    return "Les mots de passe ne correspondent pas";
  }
  return "";
});

const isFormValid = computed<boolean>(() => {
  return (
    name.value !== "" &&
    email.value !== "" &&
    password.value !== "" &&
    confirmPassword.value !== "" &&
    !passwordError.value
  );
});

const handleSubmit = async (): Promise<void> => {
  if (!isFormValid.value) return;

  const success = await authStore.register(
    email.value,
    password.value,
    name.value
  );
  if (success) {
    router.push("/");
  }
};
</script>
