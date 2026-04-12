<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();
const form = reactive({
  username: "user1",
  password: "1234"
});
const errorMessage = ref("");

function login() {
  const result = auth.login(form.username, form.password);
  if (!result.ok) {
    errorMessage.value = result.message;
    return;
  }
  errorMessage.value = "";
  router.push({ name: "home" });
}
</script>

<template>
  <section class="card login-card">
    <h1>登入</h1>
    <p>測試帳號：admin/admin、user1/1234、user2/1234</p>

    <form class="form-grid" @submit.prevent="login">
      <label class="field">
        <span>帳號</span>
        <input v-model="form.username" type="text" autocomplete="username" />
      </label>

      <label class="field">
        <span>密碼</span>
        <input v-model="form.password" type="password" autocomplete="current-password" />
      </label>

      <p v-if="errorMessage" class="banner error">{{ errorMessage }}</p>
      <button type="submit">登入</button>
    </form>
  </section>
</template>
