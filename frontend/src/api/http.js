// src/api/http.js
import { API_BASE_URL } from "./config";

function buildUrl(path, queryParams = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${cleanPath}`);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function parseJsonSafely(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Invalid JSON response:", error);
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    query,
    headers = {},
    body,
    fallback = null,
  } = options;

  const url = buildUrl(path, query);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await parseJsonSafely(response);

    if (!response.ok) {
      console.error("API error:", {
        url,
        status: response.status,
        statusText: response.statusText,
        data,
      });
      return fallback;
    }

    return data ?? fallback;
  } catch (error) {
    console.error("Network/API request failed:", {
      url,
      error,
    });
    return fallback;
  }
}
