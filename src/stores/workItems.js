import { defineStore } from "pinia";
import { useUiStore } from "./ui";
import {
  confirmWorkItems,
  createAdminItem,
  deleteAdminItem,
  getWorkItemDetailByUser,
  listWorkItemsByUser,
  undoWorkItem,
  updateAdminItem
} from "../services/workItemService";

export const useWorkItemsStore = defineStore("work-items", {
  state: () => ({
    userItems: [],
    loading: false
  }),
  actions: {
    async fetchUserItems(userId, token) {
      const ui = useUiStore();
      this.loading = true;
      try {
        this.userItems = await listWorkItemsByUser(userId, token);
      } catch (error) {
        ui.notify("error", error instanceof Error ? error.message : "讀取失敗");
      } finally {
        this.loading = false;
      }
    },
    async fetchDetail(userId, id, token) {
      return getWorkItemDetailByUser(userId, id, token);
    },
    async confirmSelected(userId, ids, token) {
      const ui = useUiStore();
      this.loading = true;
      try {
        this.userItems = await confirmWorkItems(userId, ids, token);
        ui.notify("success", "已將選取項目更新為已確認");
      } catch (error) {
        ui.notify("error", error instanceof Error ? error.message : "更新失敗");
      } finally {
        this.loading = false;
      }
    },
    async undo(userId, id, token) {
      const ui = useUiStore();
      this.loading = true;
      try {
        this.userItems = await undoWorkItem(userId, id, token);
        ui.notify("success", "已撤銷為待確認");
      } catch (error) {
        ui.notify("error", error instanceof Error ? error.message : "撤銷失敗");
      } finally {
        this.loading = false;
      }
    },
    async createAdmin(payload) {
      const ui = useUiStore();
      this.loading = true;
      try {
        await createAdminItem(payload, payload.token);
        this.userItems = await listWorkItemsByUser(payload.userId, payload.token);
        ui.notify("success", "新增成功");
        return true;
      } catch (error) {
        ui.notify("error", error instanceof Error ? error.message : "新增失敗");
        return false;
      } finally {
        this.loading = false;
      }
    },
    async updateAdmin(id, payload) {
      const ui = useUiStore();
      this.loading = true;
      try {
        await updateAdminItem(id, payload, payload.token);
        this.userItems = await listWorkItemsByUser(payload.userId, payload.token);
        ui.notify("success", "修改成功");
        return true;
      } catch (error) {
        ui.notify("error", error instanceof Error ? error.message : "修改失敗");
        return false;
      } finally {
        this.loading = false;
      }
    },
    async removeAdmin(id, userId, token) {
      const ui = useUiStore();
      this.loading = true;
      try {
        await deleteAdminItem(id, token);
        this.userItems = await listWorkItemsByUser(userId, token);
        ui.notify("success", "刪除成功");
      } catch (error) {
        ui.notify("error", error instanceof Error ? error.message : "刪除失敗");
      } finally {
        this.loading = false;
      }
    }
  }
});
