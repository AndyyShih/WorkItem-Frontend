<template>
  <div class="layout-root">
    <header class="topbar">
      <div>
        <strong>My Work Item</strong>
      </div>
      <div class="topbar-right">
        <span v-if="auth.isAuthenticated" class="user-chip">
          {{ auth.user.name }} ({{ auth.user.role }})
        </span>
        <button v-if="auth.isAuthenticated" type="button" class="ghost" @click="logout">登出</button>
      </div>
    </header>

    <div :class="['layout-body', auth.isAuthenticated ? 'with-sidebar' : 'no-sidebar']">
      <aside v-if="auth.isAuthenticated" class="sidebar">
        <RouterLink to="/">導覽首頁</RouterLink>
        <RouterLink to="/work-items">Work Item</RouterLink>
        <RouterLink v-if="auth.isAdmin" to="/admin/work-items">Admin Work Item</RouterLink>
      </aside>

      <main :class="['content-area', route.name === 'login' ? 'content-center' : '']">
        <RouterView />
      </main>
    </div>

    <ToastStack />
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth";
import ConfirmDialog from "./components/ConfirmDialog.vue";
import ToastStack from "./components/ToastStack.vue";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

function logout() {
  auth.logout();
  router.push({ name: "login" });
}
</script>
