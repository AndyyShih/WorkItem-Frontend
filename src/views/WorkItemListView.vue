<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useUiStore } from "../stores/ui";
import { useWorkItemsStore } from "../stores/workItems";

const auth = useAuthStore();
const ui = useUiStore();
const workItems = useWorkItemsStore();
const selectedIds = ref([]);
const isAdmin = computed(() => auth.isAdmin);
const editingId = ref(null);
const itemForm = reactive({
  title: "",
  description: ""
});
const formOpen = ref(false);
const submitting = ref(false);

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
  const ok = await ui.confirm("確定要確認所選工作項目？");
  if (!ok) {
    return;
  }
  await workItems.confirmSelected(auth.user.username, selectedIds.value, auth.token);
  selectedIds.value = [];
}

function createWorkItem() {
  editingId.value = null;
  itemForm.title = "";
  itemForm.description = "";
  formOpen.value = true;
}

function editWorkItem(item) {
  editingId.value = item.id;
  itemForm.title = item.title || "";
  itemForm.description = item.description || "";
  formOpen.value = true;
}

function closeFormModal() {
  formOpen.value = false;
}

async function submitItemForm() {
  if (submitting.value) {
    return;
  }
  if (!itemForm.title.trim()) {
    ui.notify("error", "標題為必填");
    return;
  }

  submitting.value = true;
  const payload = {
    title: itemForm.title.trim(),
    description: itemForm.description.trim(),
    userId: auth.user.username,
    token: auth.token
  };

  const ok =
    editingId.value === null
      ? await workItems.createAdmin(payload)
      : await workItems.updateAdmin(editingId.value, payload);

  submitting.value = false;
  if (ok) {
    formOpen.value = false;
  }
}

async function deleteWorkItem(id) {
  const ok = await ui.confirm("確定要刪除這筆 Work Item？");
  if (!ok) {
    return;
  }
  await workItems.removeAdmin(id, auth.user.username, auth.token);
}

async function confirmOne(id) {
  const ok = await ui.confirm("確定要確認這筆工作項目？");
  if (!ok) {
    return;
  }
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
      <div class="actions-row">
        <button
          v-if="isAdmin"
          type="button"
          class="success"
          @click="createWorkItem"
        >
          新增
        </button>
        <button type="button" :disabled="!canConfirm" @click="confirmSelected">確認所選項目</button>
      </div>
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
            <RouterLink
              class="button-link ghost-link"
              :to="{ name: 'work-item-detail', params: { id: item.id } }"
            >
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
              class="cancel"
              @click="undo(item.id)"
            >
              撤銷
            </button>
            <button
              v-if="isAdmin"
              type="button"
              class="edit"
              @click="editWorkItem(item)"
            >
              修改
            </button>
            <button
              v-if="isAdmin"
              type="button"
              class="danger"
              @click="deleteWorkItem(item.id)"
            >
              刪除
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="formOpen" class="confirm-overlay">
      <section class="form-modal">
        <h2>{{ editingId === null ? "新增工作項目" : "修改工作項目" }}</h2>
        <div class="form-grid">
          <label class="field">
            <span>標題（必填）</span>
            <input v-model="itemForm.title" type="text" />
          </label>
          <label class="field">
            <span>描述</span>
            <textarea v-model="itemForm.description" rows="4"></textarea>
          </label>
          <div class="confirm-actions">
            <button type="button" class="ghost" @click="closeFormModal">取消</button>
            <button type="button" :disabled="submitting" @click="submitItemForm">
              {{ submitting ? "送出中..." : "儲存" }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>
