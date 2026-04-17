export const API_URLS = {
  localUrl: import.meta.env.VITE_API_LOCAL_URL || "http://localhost:5284",
  devUrl: import.meta.env.VITE_API_DEV_URL || "http://localhost:5284"
};

const target = (import.meta.env.VITE_API_TARGET || "local").toLowerCase();

export const API_BASE_URL = target === "dev" ? API_URLS.devUrl : API_URLS.localUrl;
