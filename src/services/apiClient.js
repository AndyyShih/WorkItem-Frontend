import { API_BASE_URL } from "../config";

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

export async function apiRequest({
  path,
  method = "GET",
  token,
  body,
  headers,
  fallbackError = "API 呼叫失敗"
}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(token, body !== undefined, headers),
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // ignore non-JSON response
  }

  if (!response.ok) {
    throw new Error(resolveErrorMessage(payload, fallbackError));
  }

  if (payload && payload.isSuccess === false) {
    throw new Error(resolveErrorMessage(payload, fallbackError));
  }

  return payload;
}

export async function apiGet(path, options = {}) {
  return apiRequest({ ...options, path, method: "GET" });
}

export async function apiPost(path, body, options = {}) {
  return apiRequest({ ...options, path, method: "POST", body });
}
