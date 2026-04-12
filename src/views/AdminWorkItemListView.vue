<script setup>
import { onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useWorkItemsStore } from "../stores/workItems";

const store = useWorkItemsStore();

function formatDate(value) {
  return new Date(value).toLocaleString("zh-TW");
}

async function removeItem(id) {
  const ok = window.confirm("確定要刪除這筆 Work Item？");
  if (!ok) {
    return;
  }
  await store.removeAdmin(id);
}

onMounted(() => {
  store.fetchAdminItems();
});
</script>

<template>
  <section class="card card-wide">
    <div class="section-header">
      <h1>Admin Work Item</h1>
      <RouterLink class="button-link" :to="{ name: 'admin-work-item-new' }">新增 Work Item</RouterLink>
    </div>

    <p v-if="store.feedback" :class="['banner', store.feedback.type]">
      {{ store.feedback.message }}
    </p>

    <p v-if="store.loading" class="hint">讀取中...</p>
    <p v-else-if="store.adminItems.length === 0" class="empty">目前無資料</p>

    <table v-else class="table">
      <thead>
        <tr>
          <th>編號</th>
          <th>標題</th>
          <th>更新時間</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in store.adminItems" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.title }}</td>
          <td>{{ formatDate(item.updatedAt) }}</td>
          <td class="actions-row">
            <RouterLink
              class="text-link"
              :to="{ name: 'admin-work-item-edit', params: { id: item.id } }"
            >
              編輯
            </RouterLink>
            <button type="button" class="danger" @click="removeItem(item.id)">刪除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
