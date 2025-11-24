// src/shared/api/http.ts

export const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export type HttpBody = Record<string, unknown>;

export type RequestOptions = {
  method?: string;
  body?: HttpBody;
  headers?: Record<string, string>;
};

export async function apiFetch<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const url = path.startsWith("/") ? API_BASE + path : `${API_BASE}/${path}`;
  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers ?? {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: "include", // so http-only cookies work
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API error");
  }

  // Handle empty responses (e.g., 204 No Content)
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}
