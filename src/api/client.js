const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function apiFetch(path, options = {}) {
  const { method = "GET", body, token } = options;
  const headers = {};
  const authToken = token || localStorage.getItem("gcms_token");
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  if (body && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body
      ? isFormData
        ? body
        : JSON.stringify(body)
      : undefined
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }
  return payload;
}
