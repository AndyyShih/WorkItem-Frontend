<script setup>
import { useUiStore } from "../stores/ui";

const ui = useUiStore();
</script>

<template>
  <div class="toast-stack" aria-live="polite">
    <article v-for="toast in ui.toasts" :key="toast.id" :class="['toast', toast.type]">
      <p>{{ toast.message }}</p>
      <button type="button" class="toast-close" @click="ui.removeToast(toast.id)">×</button>
    </article>
  </div>
</template>
