<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center"
      >
        <h1 class="text-xl font-semibold text-gray-800">HomeTracker</h1>

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
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-semibold text-gray-800">
              Tableau de bord
            </h2>
            <p class="text-gray-600">Bienvenue {{ authStore.userFullName }}</p>
            <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-600">
              Rôle: <span class="font-medium">{{ getUserRoleName() }}</span>
            </p>
          </div>
        </div>

        <!-- House information -->
        <div class="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-100">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-lg font-medium text-gray-800">
                {{ house?.name || "Votre maison" }}
              </h3>
              <p v-if="house?.address" class="text-gray-600 mt-1">
                {{ house.address }}
              </p>
              <p v-if="house?.city && house?.postalCode" class="text-gray-600">
                {{ house.city }}, {{ house.postalCode }}
              </p>
            </div>

            <Button
              variant="secondary"
              class="text-sm"
              @click="openHouseSettings"
            >
              Paramètres de la maison
            </Button>
          </div>
        </div>

        <!-- Stats overview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="bg-gray-50 rounded-lg p-6 border border-gray-100">
            <h3 class="text-lg font-medium text-gray-800 mb-2">Membres</h3>
            <p class="text-3xl font-semibold text-blue-600">
              {{ houseMembers.length }}
            </p>
            <p class="text-sm text-gray-600 mt-2">
              Personnes dans votre maison
            </p>
          </div>

          <div class="bg-gray-50 rounded-lg p-6 border border-gray-100">
            <h3 class="text-lg font-medium text-gray-800 mb-2">Tâches</h3>
            <p class="text-3xl font-semibold text-green-600">0</p>
            <p class="text-sm text-gray-600 mt-2">Fonctionnalité à venir</p>
          </div>

          <div class="bg-gray-50 rounded-lg p-6 border border-gray-100">
            <h3 class="text-lg font-medium text-gray-800 mb-2">
              Notifications
            </h3>
            <p class="text-3xl font-semibold text-yellow-600">0</p>
            <p class="text-sm text-gray-600 mt-2">Fonctionnalité à venir</p>
          </div>
        </div>

        <!-- House members -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-800">
              Membres de la maison
            </h3>
            <Button
              variant="primary"
              class="text-sm"
              @click="showInviteDialog = true"
            >
              Inviter un membre
            </Button>
          </div>

          <div
            class="bg-gray-50 rounded-lg border border-gray-100 overflow-hidden"
          >
            <ul class="divide-y divide-gray-200">
              <li
                v-for="member in houseMembers"
                :key="member.id"
                class="p-4 flex justify-between items-center"
              >
                <div>
                  <p class="font-medium text-gray-800">
                    {{ member.firstName }} {{ member.lastName }}
                  </p>
                  <p class="text-sm text-gray-600">{{ member.email }}</p>
                </div>
                <span
                  class="text-sm px-2 py-1 rounded-full"
                  :class="
                    member.roleId === 2
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  "
                >
                  {{ getMemberRoleName(member.roleId) }}
                </span>
              </li>

              <li
                v-if="houseMembers.length === 0"
                class="p-4 text-center text-gray-600"
              >
                Aucun membre pour le moment
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>

    <!-- Invite member dialog -->
    <div
      v-if="showInviteDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">
          Inviter un nouveau membre
        </h3>

        <div v-if="!inviteCode">
          <p class="text-gray-600 mb-6">
            Générez un code d'invitation à partager avec la personne que vous
            souhaitez inviter.
          </p>

          <div class="flex justify-end space-x-3">
            <Button @click="showInviteDialog = false" variant="secondary">
              Annuler
            </Button>
            <Button
              @click="generateInviteCode"
              variant="primary"
              :loading="loading"
            >
              Générer un code
            </Button>
          </div>
        </div>

        <div v-else>
          <p class="text-gray-600 mb-4">
            Partagez ce code avec la personne que vous souhaitez inviter:
          </p>

          <div
            class="bg-gray-50 border border-gray-200 rounded-md p-4 text-center mb-6"
          >
            <p class="text-lg font-medium text-blue-600 select-all">
              {{ inviteCode }}
            </p>
            <p class="text-xs text-gray-500 mt-2">
              Ce code est valide pendant 24 heures
            </p>
          </div>

          <div class="flex justify-end">
            <Button @click="closeInviteDialog" variant="primary">
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useHouseStore } from "@/stores/house";
import Button from "@/components/Button.vue";

const router = useRouter();
const authStore = useAuthStore();
const houseStore = useHouseStore();

const loading = ref(false);
const showInviteDialog = ref(false);
const inviteCode = ref("");
const houseMembers = ref<any[]>([]);

// Vérifier si l'utilisateur est connecté et a une maison
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push("/auth/login");
    return;
  }

  if (!authStore.user?.houseId) {
    router.push("/house/select");
    return;
  }

  // Charger les informations de la maison
  if (authStore.user.houseId) {
    await houseStore.fetchHouseDetails(authStore.user.houseId);
    await fetchHouseMembers();
  }
});

// Raccourci pour accéder aux détails de la maison
const house = houseStore.currentHouse;

const fetchHouseMembers = async () => {
  loading.value = true;
  try {
    const members = await houseStore.fetchHouseMembers();
    houseMembers.value = members;
  } catch (error) {
    console.error("Erreur lors du chargement des membres:", error);
  } finally {
    loading.value = false;
  }
};

const openHouseSettings = () => {
  // Implémenter la navigation vers les paramètres de la maison
  router.push("/house/settings");
};

const generateInviteCode = async () => {
  loading.value = true;
  try {
    inviteCode.value = await houseStore.generateInviteCode();
  } catch (error: any) {
    console.error("Erreur lors de la génération du code:", error);
  } finally {
    loading.value = false;
  }
};

const closeInviteDialog = () => {
  showInviteDialog.value = false;
  inviteCode.value = "";
};

const getMemberRoleName = (roleId: number): string => {
  switch (roleId) {
    case 2:
      return "Administrateur";
    case 3:
      return "Modérateur";
    case 4:
      return "Utilisateur";
    case 5:
      return "Invité";
    default:
      return "Sans rôle";
  }
};

// Fonction pour obtenir le nom du rôle de l'utilisateur actuel
const getUserRoleName = (): string => {
  if (!authStore.user?.role?.name) return "Non défini";

  switch (authStore.user.role.name) {
    case "ADMIN":
      return "Administrateur";
    case "MODERATOR":
      return "Modérateur";
    case "USER":
      return "Utilisateur";
    case "INVITED":
      return "Invité";
    default:
      return "Sans rôle";
  }
};
</script>
