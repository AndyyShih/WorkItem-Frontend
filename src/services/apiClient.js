import axios from "axios";
import { API_BASE_URL } from "../config";

const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 10000);

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number.isFinite(DEFAULT_TIMEOUT_MS) ? DEFAULT_TIMEOUT_MS : 10000
});

function buildHeaders(token, hasBody, extraHeaders = {}) {
  const headers = {
    ...extraHeaders
  };

  if (hasBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function resolveErrorMessage(payload, fallback) {
  return (
    payload?.message ||
    payload?.title ||
    (Array.isArray(payload?.errors) && payload.errors.length > 0 ? payload.errors.join(", ") : "") ||
    fallback
  );
}

http.interceptors.response.use(
  (response) => {
    const payload = response.data;
    const fallbackError = response.config?.__fallbackError || "API request failed";

    if (payload && payload.isSuccess === false) {
      return Promise.reject(new Error(resolveErrorMessage(payload, fallbackError)));
    }

    return response;
  },
  (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const fallbackError = error.config?.__fallbackError || "API request failed";

    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Request timeout"));
    }

    const payload = error.response?.data;
    return Promise.reject(new Error(resolveErrorMessage(payload, fallbackError)));
  }
);

export async function apiRequest({
  path,
  method = "GET",
  token,
  body,
  headers,
  fallbackError = "API request failed"
}) {
  const response = await http.request({
    url: path,
    method,
    data: body,
    headers: buildHeaders(token, body !== undefined, headers),
    __fallbackError: fallbackError
  });

  return response.data;
}

export async function apiGet(path, options = {}) {
  return apiRequest({ ...options, path, method: "GET" });
}

export async function apiPost(path, body, options = {}) {
  return apiRequest({ ...options, path, method: "POST", body });
}
