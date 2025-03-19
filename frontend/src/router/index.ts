import type { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";
import AuthLayout from "../layouts/AuthLayout.vue";
import DashboardLayout from "../layouts/DashboardLayout.vue";
import LoginView from "../views/Auth/LoginView.vue";
import RegisterView from "../views/Auth/RegisterView.vue";
import DashboardView from "../views/DashboardView.vue";
import HomeView from "../views/HomeView.vue";
import HouseSelectionView from "../views/HouseSelectionView.vue";
import {
  redirectIfAuthenticated,
  requireAuth,
  requireHouse,
  requireNoHouse,
} from "./middleware";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/auth",
    component: AuthLayout,
    beforeEnter: redirectIfAuthenticated,
    children: [
      {
        path: "login",
        name: "login",
        component: LoginView,
      },
      {
        path: "register",
        name: "register",
        component: RegisterView,
      },
    ],
  },
  {
    path: "/house/select",
    name: "houseSelect",
    component: HouseSelectionView,
    beforeEnter: requireNoHouse,
  },
  {
    path: "/dashboard",
    component: DashboardLayout,
    beforeEnter: requireAuth,
    children: [
      {
        path: "",
        name: "dashboard",
        component: DashboardView,
        beforeEnter: requireHouse,
      },
      // Ajoutez d'autres routes protégées ici, comme les paramètres de la maison, etc.
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Intercepteur global pour vérifier l'authentification
router.beforeEach(async (to, from, next) => {
  // Si la route n'a pas de garde spécifique et n'est pas publique, appliquer requireAuth
  if (
    !to.matched.some((record) => record.meta.public) &&
    !to.path.startsWith("/auth") &&
    to.path !== "/"
  ) {
    return requireAuth(to, from, next);
  }

  next();
});

export default router;
