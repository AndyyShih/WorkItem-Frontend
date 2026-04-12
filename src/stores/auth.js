import { defineStore } from "pinia";

const SESSION_KEY = "workitem-session-user";

const accounts = [
  {
    username: "admin",
    password: "admin",
    role: "admin",
    name: "System Admin"
  },
  {
    username: "user1",
    password: "1234",
    role: "user",
    name: "User One"
  },
  {
    username: "user2",
    password: "1234",
    role: "user",
    name: "User Two"
  }
];

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user),
    isAdmin: (state) => state.user?.role === "admin"
  },
  actions: {
    restoreSession() {
      if (this.user) {
        return;
      }
      const username = localStorage.getItem(SESSION_KEY);
      if (!username) {
        return;
      }
      const found = accounts.find((entry) => entry.username === username);
      if (found) {
        this.user = {
          username: found.username,
          role: found.role,
          name: found.name
        };
      }
    },
    login(username, password) {
      const found = accounts.find(
        (entry) => entry.username === username.trim() && entry.password === password
      );
      if (!found) {
        return {
          ok: false,
          message: "帳號或密碼錯誤"
        };
      }

      this.user = {
        username: found.username,
        role: found.role,
        name: found.name
      };
      localStorage.setItem(SESSION_KEY, found.username);
      return {
        ok: true
      };
    },
    logout() {
      this.user = null;
      localStorage.removeItem(SESSION_KEY);
    }
  }
});
