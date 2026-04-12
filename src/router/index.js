import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import LoginView from "../views/LoginView.vue";
import HomeView from "../views/HomeView.vue";
import WorkItemListView from "../views/WorkItemListView.vue";
import WorkItemDetailView from "../views/WorkItemDetailView.vue";
import AdminWorkItemListView from "../views/AdminWorkItemListView.vue";
import AdminWorkItemFormView from "../views/AdminWorkItemFormView.vue";

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
    },
    {
      path: "/admin/work-items",
      name: "admin-work-items",
      component: AdminWorkItemListView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: "/admin/work-items/new",
      name: "admin-work-item-new",
      component: AdminWorkItemFormView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: "/admin/work-items/:id/edit",
      name: "admin-work-item-edit",
      component: AdminWorkItemFormView,
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
});

export function installRouterGuards(targetRouter, pinia) {
  targetRouter.beforeEach((to) => {
    const auth = useAuthStore(pinia);
    auth.restoreSession();

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
