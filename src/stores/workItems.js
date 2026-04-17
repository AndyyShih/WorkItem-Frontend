import { defineStore } from "pinia";
import {
  confirmWorkItems,
  createAdminItem,
  deleteAdminItem,
  getWorkItemDetailByUser,
  listAdminItems,
  listWorkItemsByUser,
  undoWorkItem,
  updateAdminItem
} from "../services/workItemService";

export const useWorkItemsStore = defineStore("work-items", {
  state: () => ({
    userItems: [],
    adminItems: [],
    loading: false,
    feedback: null
  }),
  actions: {
    setFeedback(type, message) {
      this.feedback = { type, message };
    },
    clearFeedback() {
      this.feedback = null;
    },
    async fetchUserItems(userId, token) {
      this.loading = true;
      try {
        this.userItems = await listWorkItemsByUser(userId, token);
      } catch (error) {
        this.setFeedback("error", error instanceof Error ? error.message : "讀取失敗");
      } finally {
        this.loading = false;
      }
    },
    async fetchDetail(userId, id) {
      return getWorkItemDetailByUser(userId, id);
    },
    async confirmSelected(userId, ids) {
      this.loading = true;
      try {
        this.userItems = await confirmWorkItems(userId, ids);
        this.setFeedback("success", "已將選取項目更新為已確認");
      } catch (error) {
        this.setFeedback("error", error instanceof Error ? error.message : "更新失敗");
      } finally {
        this.loading = false;
      }
    },
    async undo(userId, id) {
      this.loading = true;
      try {
        this.userItems = await undoWorkItem(userId, id);
        this.setFeedback("success", "已撤銷為待確認");
      } catch (error) {
        this.setFeedback("error", error instanceof Error ? error.message : "撤銷失敗");
      } finally {
        this.loading = false;
      }
    },
    async fetchAdminItems() {
      this.loading = true;
      try {
        this.adminItems = await listAdminItems();
      } catch (error) {
        this.setFeedback("error", error instanceof Error ? error.message : "讀取失敗");
      } finally {
        this.loading = false;
      }
    },
    async createAdmin(payload) {
      this.loading = true;
      try {
        await createAdminItem(payload);
        this.setFeedback("success", "新增成功");
        return true;
      } catch (error) {
        this.setFeedback("error", error instanceof Error ? error.message : "新增失敗");
        return false;
      } finally {
        this.loading = false;
      }
    },
    async updateAdmin(id, payload) {
      this.loading = true;
      try {
        await updateAdminItem(id, payload);
        this.setFeedback("success", "修改成功");
        return true;
      } catch (error) {
        this.setFeedback("error", error instanceof Error ? error.message : "修改失敗");
        return false;
      } finally {
        this.loading = false;
      }
    },
    async removeAdmin(id) {
      this.loading = true;
      try {
        await deleteAdminItem(id);
        this.adminItems = this.adminItems.filter((item) => item.id !== Number(id));
        this.setFeedback("success", "刪除成功");
      } catch (error) {
        this.setFeedback("error", error instanceof Error ? error.message : "刪除失敗");
      } finally {
        this.loading = false;
      }
    }
  }
});
