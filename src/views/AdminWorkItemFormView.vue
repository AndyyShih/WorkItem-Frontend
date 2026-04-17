<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useUiStore } from "../stores/ui";
import { useWorkItemsStore } from "../stores/workItems";

const route = useRoute();
const router = useRouter();
const store = useWorkItemsStore();
const ui = useUiStore();

const form = reactive({
  title: "",
  description: ""
});
const error = ref("");
const ready = ref(false);

const isEdit = computed(() => Boolean(route.params.id));

function validate() {
  if (!form.title.trim()) {
    error.value = "標題為必填";
    ui.notify("error", error.value);
    return false;
  }
  error.value = "";
  return true;
}

async function submit() {
  if (!validate()) {
    return;
  }

  const payload = {
    title: form.title,
    description: form.description
  };

  const ok = isEdit.value
    ? await store.updateAdmin(route.params.id, payload)
    : await store.createAdmin(payload);

  if (!ok) {
    return;
  }
  router.push({ name: "admin-work-items" });
}

onMounted(async () => {
  await store.fetchAdminItems();
  if (isEdit.value) {
    const target = store.adminItems.find((item) => item.id === Number(route.params.id));
    if (!target) {
      ui.notify("error", "找不到要編輯的資料");
      router.push({ name: "admin-work-items" });
      return;
    }
    form.title = target.title;
    form.description = target.description || "";
  }
  ready.value = true;
});
</script>

<template>
  <section class="card">
    <div class="section-header">
      <h1>{{ isEdit ? "編輯 Work Item" : "新增 Work Item" }}</h1>
      <RouterLink class="text-link" :to="{ name: 'admin-work-items' }">返回列表</RouterLink>
    </div>

    <p v-if="!ready" class="hint">讀取中...</p>
    <form v-else class="form-grid" @submit.prevent="submit">
      <label class="field">
        <span>標題（必填）</span>
        <input v-model="form.title" type="text" />
      </label>
      <label class="field">
        <span>描述</span>
        <textarea v-model="form.description" rows="5"></textarea>
      </label>
      <div class="form-actions">
        <button type="submit" :disabled="store.loading">{{ isEdit ? "儲存" : "建立" }}</button>
        <RouterLink class="button-link ghost-link" :to="{ name: 'admin-work-items' }">
          取消
        </RouterLink>
      </div>
    </form>
  </section>
</template>
