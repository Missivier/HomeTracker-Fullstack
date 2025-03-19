<template>
  <FormWrapper title="Inscription" @submit="handleSubmit">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Nom -->
      <Input
        id="lastName"
        v-model="lastName"
        label="Nom"
        type="text"
        placeholder="Votre nom"
        required
      />

      <!-- Prénom -->
      <Input
        id="firstName"
        v-model="firstName"
        label="Prénom"
        type="text"
        placeholder="Votre prénom"
        required
      />
    </div>

    <!-- Email -->
    <Input
      id="email"
      v-model="email"
      label="Email"
      type="email"
      placeholder="votre@email.com"
      required
    />

    <!-- Nom d'utilisateur -->
    <Input
      id="username"
      v-model="username"
      label="Nom d'utilisateur (optionnel)"
      type="text"
      placeholder="Votre nom d'utilisateur"
    />

    <!-- Téléphone -->
    <Input
      id="phone"
      v-model="phone"
      label="Téléphone (optionnel)"
      type="tel"
      placeholder="0612345678"
      :error="phoneError"
    />

    <!-- Date de naissance -->
    <Input
      id="birthDate"
      v-model="birthDate"
      label="Date de naissance (optionnel)"
      type="date"
    />

    <!-- Description -->
    <div class="mb-4">
      <label for="description" class="block text-sm font-medium text-gray-700">
        Description (optionnel)
      </label>
      <textarea
        id="description"
        v-model="description"
        rows="3"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="Une courte description de vous-même"
      ></textarea>
    </div>

    <!-- Mot de passe -->
    <Input
      id="password"
      v-model="password"
      label="Mot de passe"
      type="password"
      placeholder="••••••••"
      required
      :error="passwordFormatError"
    />

    <!-- Confirmation du mot de passe -->
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

// Champs du formulaire
const firstName = ref<string>("");
const lastName = ref<string>("");
const email = ref<string>("");
const username = ref<string>("");
const phone = ref<string>("");
const birthDate = ref<string>("");
const description = ref<string>("");
const password = ref<string>("");
const confirmPassword = ref<string>("");

// Validation
const passwordError = computed<string>(() => {
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    return "Les mots de passe ne correspondent pas";
  }
  return "";
});

const passwordFormatError = computed<string>(() => {
  if (password.value && password.value.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères";
  }
  return "";
});

const phoneError = computed<string>(() => {
  if (phone.value && !/^\d{10}$/.test(phone.value)) {
    return "Le numéro de téléphone doit contenir 10 chiffres";
  }
  return "";
});

const isFormValid = computed<boolean>(() => {
  return (
    firstName.value.trim() !== "" &&
    lastName.value.trim() !== "" &&
    email.value.trim() !== "" &&
    password.value.trim() !== "" &&
    confirmPassword.value.trim() !== "" &&
    !passwordError.value &&
    !passwordFormatError.value &&
    !phoneError.value
  );
});

const handleSubmit = async (): Promise<void> => {
  if (!isFormValid.value) return;

  // Préparer les données d'utilisateur selon votre modèle
  const userData = {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    username: username.value || null,
    phone: phone.value || null,
    password: password.value,
    birthDate: birthDate.value || null,
    description: description.value || null,
  };

  const success = await authStore.register(userData);
  if (success) {
    router.push("/");
  }
};
</script>
