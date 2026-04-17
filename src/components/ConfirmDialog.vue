<script setup>
import { useUiStore } from "../stores/ui";

const ui = useUiStore();
</script>

<template>
  <div v-if="ui.confirmDialog.open" class="confirm-overlay">
    <section class="confirm-dialog">
      <h2>{{ ui.confirmDialog.title }}</h2>
      <p>{{ ui.confirmDialog.message }}</p>
      <div class="confirm-actions">
        <button type="button" class="ghost" @click="ui.resolveConfirm(false)">取消</button>
        <button type="button" @click="ui.resolveConfirm(true)">確認</button>
      </div>
    </section>
  </div>
</template>
