import { apiGet, apiPost } from "./apiClient";

export async function loginApi(username, password) {
  return apiPost(
    "/api/Auth/Login",
    {
      username,
      password
    },
    { fallbackError: "登入失敗" }
  );
}

export async function getProfileApi(token) {
  return apiGet("/api/Auth/Profile", {
    token,
    fallbackError: "取得使用者資料失敗"
  });
}
