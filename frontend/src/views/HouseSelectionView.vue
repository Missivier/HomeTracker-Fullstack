<template>
  <div
    class="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-2xl w-full mx-auto">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Bienvenue {{ authStore.userFullName }}
        </h1>
        <p class="text-gray-600">Email: {{ authStore.user?.email }}</p>
      </div>

      <div
        class="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
      >
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">
            Vous n'êtes pas encore associé à une maison
          </h2>
          <p class="text-gray-600 mb-6">
            Choisissez parmi les options suivantes pour continuer:
          </p>

          <div class="space-y-6">
            <!-- Créer une nouvelle maison -->
            <div
              class="border border-gray-200 rounded-lg p-6 transition-all hover:shadow-md"
            >
              <h3 class="text-lg font-medium text-gray-800 mb-3">
                Créer une nouvelle maison
              </h3>
              <p class="text-gray-600 mb-4">
                Configurez votre propre espace et invitez d'autres personnes à
                le rejoindre.
              </p>

              <FormWrapper
                title=""
                v-if="showCreateForm"
                @submit="handleCreateHouse"
              >
                <Input
                  id="houseName"
                  v-model="newHouse.name"
                  label="Nom de la maison"
                  type="text"
                  placeholder="Ma maison"
                  required
                />

                <Input
                  id="houseAddress"
                  v-model="newHouse.address"
                  label="Adresse"
                  type="text"
                  placeholder="123 rue des exemples"
                />

                <Input
                  id="houseCity"
                  v-model="newHouse.city"
                  label="Ville"
                  type="text"
                  placeholder="Paris"
                />

                <Input
                  id="housePostalCode"
                  v-model="newHouse.postalCode"
                  label="Code postal"
                  type="text"
                  placeholder="75000"
                />

                <Input
                  id="houseCountry"
                  v-model="newHouse.country"
                  label="Pays"
                  type="text"
                  placeholder="France"
                />

                <div class="mb-4">
                  <label
                    for="houseDescription"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description (optionnel)
                  </label>
                  <textarea
                    id="houseDescription"
                    v-model="newHouse.description"
                    rows="3"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Une brève description de votre maison"
                  ></textarea>
                </div>

                <div class="flex justify-end space-x-3 mt-6">
                  <Button
                    @click.prevent="showCreateForm = false"
                    variant="secondary"
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary" :loading="loading">
                    Créer la maison
                  </Button>
                </div>
              </FormWrapper>

              <div v-else class="mt-4">
                <Button @click="showCreateForm = true" variant="primary">
                  Créer une maison
                </Button>
              </div>
            </div>

            <!-- Rejoindre une maison existante -->
            <div
              class="border border-gray-200 rounded-lg p-6 transition-all hover:shadow-md"
            >
              <h3 class="text-lg font-medium text-gray-800 mb-3">
                Rejoindre une maison existante
              </h3>
              <p class="text-gray-600 mb-4">
                Rejoignez une maison dont vous avez reçu une invitation.
              </p>

              <FormWrapper
                title=""
                v-if="showJoinForm"
                @submit="handleJoinHouse"
              >
                <Input
                  id="houseCode"
                  v-model="houseCode"
                  label="Code d'invitation"
                  type="text"
                  placeholder="Entrez le code d'invitation"
                  required
                />

                <div class="flex justify-end space-x-3 mt-6">
                  <Button
                    @click.prevent="showJoinForm = false"
                    variant="secondary"
                  >
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary" :loading="loading">
                    Rejoindre la maison
                  </Button>
                </div>
              </FormWrapper>

              <div v-else class="mt-4">
                <Button @click="showJoinForm = true" variant="primary">
                  Rejoindre une maison
                </Button>
              </div>
            </div>
          </div>

          <p v-if="error" class="mt-6 text-center text-red-600">{{ error }}</p>
        </div>
      </div>

      <div class="mt-6 text-center">
        <button
          @click="authStore.logout()"
          class="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useHouseStore } from "@/stores/house";
import Button from "@/components/Button.vue";
import Input from "@/components/Input.vue";
import FormWrapper from "@/components/FormWrapper.vue";

const router = useRouter();
const authStore = useAuthStore();
const houseStore = useHouseStore();

const showCreateForm = ref(false);
const showJoinForm = ref(false);
const loading = ref(false);
const error = ref("");
const houseCode = ref("");

const newHouse = ref({
  name: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  description: "",
});

// Si l'utilisateur est déjà connecté à une maison, rediriger vers le dashboard
if (authStore.user?.houseId) {
  router.push("/dashboard");
}

const handleCreateHouse = async () => {
  loading.value = true;
  error.value = "";

  try {
    const success = await houseStore.createHouse(newHouse.value);
    if (success) {
      // Mettre à jour le profil utilisateur pour avoir la nouvelle houseId
      await authStore.fetchUserProfile();
      router.push("/dashboard");
    }
  } catch (err: any) {
    error.value =
      err.message || "Une erreur est survenue lors de la création de la maison";
  } finally {
    loading.value = false;
  }
};

const handleJoinHouse = async () => {
  loading.value = true;
  error.value = "";

  try {
    const success = await houseStore.joinHouse(houseCode.value);
    if (success) {
      // Mettre à jour le profil utilisateur pour avoir la nouvelle houseId
      await authStore.fetchUserProfile();
      router.push("/dashboard");
    }
  } catch (err: any) {
    error.value = err.message || "Code d'invitation invalide ou expiré";
  } finally {
    loading.value = false;
  }
};
</script>
