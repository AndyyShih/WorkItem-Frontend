<script setup>
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
</script>

<template>
  <section class="card">
    <h1>導覽首頁</h1>
    <p>歡迎回來，{{ auth.user?.name }}。</p>
    <p>請從左側選單點選「Work Item」進入功能頁面。</p>
    <p v-if="auth.isAdmin">你目前是 admin，可進入 Admin Work Item 進行管理。</p>
  </section>
</template>
