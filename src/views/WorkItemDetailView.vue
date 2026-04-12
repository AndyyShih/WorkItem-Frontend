<script setup>
import { onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useWorkItemsStore } from "../stores/workItems";

const auth = useAuthStore();
const store = useWorkItemsStore();
const route = useRoute();
const item = ref(null);
const loading = ref(false);

function formatDate(value) {
  return new Date(value).toLocaleString("zh-TW");
}

function statusLabel(status) {
  return status === "confirmed" ? "已確認" : "待確認";
}

onMounted(async () => {
  loading.value = true;
  item.value = await store.fetchDetail(auth.user.username, route.params.id);
  loading.value = false;
});
</script>

<template>
  <section class="card">
    <div class="section-header">
      <h1>Work Item Detail</h1>
      <RouterLink class="text-link" :to="{ name: 'work-items' }">返回列表</RouterLink>
    </div>

    <p v-if="loading" class="hint">讀取中...</p>
    <p v-else-if="!item" class="empty">找不到這筆資料</p>
    <dl v-else class="detail-grid">
      <dt>ID</dt>
      <dd>{{ item.id }}</dd>
      <dt>標題</dt>
      <dd>{{ item.title }}</dd>
      <dt>描述</dt>
      <dd>{{ item.description || "（無）" }}</dd>
      <dt>建立時間</dt>
      <dd>{{ formatDate(item.createdAt) }}</dd>
      <dt>狀態</dt>
      <dd><span :class="['status-tag', item.status]">{{ statusLabel(item.status) }}</span></dd>
      <dt>更新時間</dt>
      <dd>{{ formatDate(item.updatedAt) }}</dd>
    </dl>
  </section>
</template>
