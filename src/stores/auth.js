import { defineStore } from "pinia";
import { getProfileApi, loginApi } from "../services/authService";

const TOKEN_KEY = "workitem-session-token";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    initialized: false
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user),
    isAdmin: (state) => String(state.user?.role || "").toLowerCase() === "admin"
  },
  actions: {
    async restoreSession() {
      if (this.initialized) {
        return;
      }
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        this.initialized = true;
        return;
      }

      try {
        const payload = await getProfileApi(token);
        const profile = payload?.data;
        this.user = {
          id: profile?.id,
          username: profile?.username,
          name: profile?.username || profile?.name || "User",
          role: String(profile?.role || "user").toLowerCase()
        };
        this.token = token;
      } catch {
        this.logout();
      } finally {
        this.initialized = true;
      }
    },
    async login(username, password) {
      try {
        const payload = await loginApi(username.trim(), password);
        const resolvedUser = payload?.data || {
          username: username.trim(),
          role: username.trim().toLowerCase() === "admin" ? "admin" : "user"
        };
        const resolvedToken =
          payload?.data?.token || payload?.token || payload?.accessToken || payload?.jwt || null;
        if (!resolvedToken) {
          throw new Error("登入成功但未取得 token");
        }

        this.user = {
          id: resolvedUser.id,
          username: resolvedUser.username || username.trim(),
          name: resolvedUser.username || username.trim(),
          role: String(resolvedUser.role || "user").toLowerCase()
        };
        this.token = resolvedToken;
        if (resolvedToken) {
          localStorage.setItem(TOKEN_KEY, resolvedToken);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
        this.initialized = true;

        return {
          ok: true
        };
      } catch (error) {
        return {
          ok: false,
          message: error instanceof Error ? error.message : "登入失敗"
        };
      }
    },
    logout() {
      this.user = null;
      this.token = null;
      this.initialized = true;
      localStorage.removeItem(TOKEN_KEY);
    }
  }
});
