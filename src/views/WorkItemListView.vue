<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import { useWorkItemsStore } from "../stores/workItems";

const auth = useAuthStore();
const ui = useUiStore();
const workItems = useWorkItemsStore();
const selectedIds = ref([]);

const allSelected = computed({
  get() {
    return (
      workItems.userItems.length > 0 && selectedIds.value.length === workItems.userItems.length
    );
  },
  set(checked) {
    selectedIds.value = checked ? workItems.userItems.map((item) => item.id) : [];
  }
});

const canConfirm = computed(() => selectedIds.value.length > 0 && !workItems.loading);

function statusLabel(status) {
  return status === "confirmed" ? "已確認" : "待確認";
}

function formatDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString("zh-TW");
}

function toggleSelect(id, checked) {
  if (checked) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value.push(id);
    }
    return;
  }
  selectedIds.value = selectedIds.value.filter((entry) => entry !== id);
}

async function confirmSelected() {
  if (!canConfirm.value) {
    return;
  }
  await workItems.confirmSelected(auth.user.username, selectedIds.value, auth.token);
  selectedIds.value = [];
}

async function confirmOne(id) {
  await workItems.confirmSelected(auth.user.username, [id], auth.token);
  selectedIds.value = selectedIds.value.filter((entry) => entry !== id);
}

async function undo(id) {
  const ok = await ui.confirm("確定要將此項目撤銷為待確認？");
  if (!ok) {
    return;
  }
  await workItems.undo(auth.user.username, id, auth.token);
}

onMounted(() => {
  workItems.fetchUserItems(auth.user.username, auth.token);
});
</script>

<template>
  <section class="card card-wide">
    <div class="section-header">
      <h1>Work Item</h1>
      <button type="button" :disabled="!canConfirm" @click="confirmSelected">確認所選項目</button>
    </div>

    <p v-if="workItems.loading" class="hint">讀取中...</p>
    <p v-else-if="workItems.userItems.length === 0" class="empty">目前無待辦項目</p>

    <table v-else class="table">
      <thead>
        <tr>
          <th class="checkbox-cell"><input v-model="allSelected" type="checkbox" /></th>
          <th>編號</th>
          <th>標題</th>
          <th>狀態</th>
          <th>建立時間</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in workItems.userItems"
          :key="item.id"
          :class="{ selected: selectedIds.includes(item.id) }"
        >
          <td class="checkbox-cell">
            <input
              :checked="selectedIds.includes(item.id)"
              type="checkbox"
              @change="toggleSelect(item.id, $event.target.checked)"
            />
          </td>
          <td>{{ item.id }}</td>
          <td>{{ item.title }}</td>
          <td>
            <span :class="['status-tag', item.status]">{{ statusLabel(item.status) }}</span>
          </td>
          <td>{{ formatDate(item.createdAt) }}</td>
          <td class="actions-row">
            <RouterLink class="text-link" :to="{ name: 'work-item-detail', params: { id: item.id } }">
              查看詳情
            </RouterLink>
            <button
              v-if="item.status !== 'confirmed'"
              type="button"
              @click="confirmOne(item.id)"
            >
              確認
            </button>
            <button
              v-if="item.status === 'confirmed'"
              type="button"
              class="ghost"
              @click="undo(item.id)"
            >
              撤銷
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
