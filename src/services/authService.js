import { API_BASE_URL } from "../config";

const LOGIN_URL = `${API_BASE_URL}/api/Auth/Login`;
const PROFILE_URL = `${API_BASE_URL}/api/Auth/Profile`;

export async function loginApi(username, password) {
  const response = await fetch(LOGIN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username,
      password
    })
  });

  if (!response.ok) {
    let message = "登入失敗";
    try {
      const errorData = await response.json();
      message = errorData?.message || errorData?.title || message;
    } catch {
      // Keep default message when backend does not return JSON
    }
    throw new Error(message);
  }

  const payload = await response.json();
  if (!payload?.isSuccess) {
    const message =
      payload?.message ||
      (Array.isArray(payload?.errors) && payload.errors.length > 0
        ? payload.errors.join(", ")
        : "登入失敗");
    throw new Error(message);
  }

  return payload;
}

export async function getProfileApi(token) {
  const response = await fetch(PROFILE_URL, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("取得使用者資料失敗");
  }

  const payload = await response.json();
  if (!payload?.isSuccess) {
    const message =
      payload?.message ||
      (Array.isArray(payload?.errors) && payload.errors.length > 0
        ? payload.errors.join(", ")
        : "取得使用者資料失敗");
    throw new Error(message);
  }

  return payload;
}
