import api from "@/services/api";
import { defineStore } from "pinia";

interface House {
  id: number;
  name: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  description?: string;
}

interface HouseCreationData {
  name: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  description?: string;
}

export const useHouseStore = defineStore("house", {
  state: () => ({
    currentHouse: null as House | null,
    inviteCode: null as string | null,
    houseMembers: [] as any[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async createHouse(houseData: HouseCreationData): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post("/houses", houseData);
        this.currentHouse = response.data.house;
        return true;
      } catch (error: any) {
        console.error("Erreur création maison:", error);
        if (error.response && error.response.data) {
          this.error =
            error.response.data.message ||
            "Erreur lors de la création de la maison";
        } else {
          this.error = "Erreur de connexion au serveur";
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async joinHouse(inviteCode: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post("/houses/join", { inviteCode });
        this.currentHouse = response.data.house;
        return true;
      } catch (error: any) {
        console.error(
          "Erreur lors de la tentative de rejoindre la maison:",
          error
        );
        if (error.response && error.response.data) {
          this.error =
            error.response.data.message || "Code d'invitation invalide";
        } else {
          this.error = "Erreur de connexion au serveur";
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchHouseDetails(houseId: number): Promise<House> {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(`/houses/${houseId}`);
        this.currentHouse = response.data;
        return response.data;
      } catch (error: any) {
        console.error("Erreur récupération détails maison:", error);
        if (error.response && error.response.data) {
          this.error =
            error.response.data.message ||
            "Erreur lors du chargement des détails";
        } else {
          this.error = "Erreur de connexion au serveur";
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchHouseMembers(): Promise<any[]> {
      if (!this.currentHouse?.id) {
        throw new Error("Aucune maison sélectionnée");
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await api.get(
          `/houses/${this.currentHouse.id}/members`
        );
        this.houseMembers = response.data;
        return response.data;
      } catch (error: any) {
        console.error("Erreur récupération membres:", error);
        if (error.response && error.response.data) {
          this.error =
            error.response.data.message ||
            "Erreur lors du chargement des membres";
        } else {
          this.error = "Erreur de connexion au serveur";
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async generateInviteCode(): Promise<string> {
      if (!this.currentHouse?.id) {
        throw new Error("Aucune maison sélectionnée");
      }

      this.loading = true;
      this.error = null;

      try {
        const response = await api.post(
          `/houses/${this.currentHouse.id}/invite`
        );
        this.inviteCode = response.data.inviteCode;
        return response.data.inviteCode;
      } catch (error: any) {
        console.error("Erreur génération code invite:", error);
        if (error.response && error.response.data) {
          this.error =
            error.response.data.message ||
            "Erreur lors de la génération du code";
        } else {
          this.error = "Erreur de connexion au serveur";
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
