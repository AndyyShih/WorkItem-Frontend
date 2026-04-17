import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import LoginView from "../views/LoginView.vue";
import HomeView from "../views/HomeView.vue";
import WorkItemListView from "../views/WorkItemListView.vue";
import WorkItemDetailView from "../views/WorkItemDetailView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView
    },
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: "/work-items",
      name: "work-items",
      component: WorkItemListView,
      meta: { requiresAuth: true }
    },
    {
      path: "/work-items/:id",
      name: "work-item-detail",
      component: WorkItemDetailView,
      meta: { requiresAuth: true }
    }
  ]
});

export function installRouterGuards(targetRouter, pinia) {
  targetRouter.beforeEach(async (to) => {
    const auth = useAuthStore(pinia);
    await auth.restoreSession();

    if (to.name === "login" && auth.isAuthenticated) {
      return { name: "home" };
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return { name: "login" };
    }

    if (to.meta.requiresAdmin && !auth.isAdmin) {
      return { name: "home" };
    }

    return true;
  });
}

export default router;
