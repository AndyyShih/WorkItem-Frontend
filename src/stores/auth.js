import { defineStore } from "pinia";
import { loginApi } from "../services/authService";

const SESSION_KEY = "workitem-session-user";
const TOKEN_KEY = "workitem-session-token";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user),
    isAdmin: (state) => String(state.user?.role || "").toLowerCase() === "admin"
  },
  actions: {
    restoreSession() {
      if (this.user) {
        return;
      }
      const rawUser = localStorage.getItem(SESSION_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (!rawUser) {
        return;
      }

      try {
        this.user = JSON.parse(rawUser);
        this.token = token || null;
      } catch {
        this.user = null;
        this.token = null;
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
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

        this.user = {
          id: resolvedUser.id,
          username: resolvedUser.username || username.trim(),
          name: resolvedUser.username || username.trim(),
          role: String(resolvedUser.role || "user").toLowerCase()
        };
        this.token = resolvedToken;
        localStorage.setItem(SESSION_KEY, JSON.stringify(this.user));
        if (resolvedToken) {
          localStorage.setItem(TOKEN_KEY, resolvedToken);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }

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
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }
});
