import { defineStore } from "pinia";

let seed = 0;

export const useUiStore = defineStore("ui", {
  state: () => ({
    toasts: [],
    confirmDialog: {
      open: false,
      title: "",
      message: ""
    },
    _confirmResolver: null
  }),
  actions: {
    notify(type, message, duration = 2600) {
      const id = ++seed;
      this.toasts.push({ id, type, message });
      window.setTimeout(() => {
        this.removeToast(id);
      }, duration);
    },
    removeToast(id) {
      this.toasts = this.toasts.filter((item) => item.id !== id);
    },
    confirm(message, title = "請確認") {
      this.confirmDialog = {
        open: true,
        title,
        message
      };
      return new Promise((resolve) => {
        this._confirmResolver = resolve;
      });
    },
    resolveConfirm(result) {
      if (this._confirmResolver) {
        this._confirmResolver(result);
      }
      this._confirmResolver = null;
      this.confirmDialog = {
        open: false,
        title: "",
        message: ""
      };
    }
  }
});
