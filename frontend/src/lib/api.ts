const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;

export const API_BASE_URL =
  rawApiUrl && rawApiUrl.trim().length > 0
    ? rawApiUrl.replace(/\/$/, "")
    : "http://localhost:4000";

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

export function storeToken(token: string): void {
  localStorage.setItem("token", token);
}

export function clearStoredToken(): void {
  localStorage.removeItem("token");
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiFetchOptions = RequestInit & {
  token?: string | null;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { token, headers, body, ...rest } = options;

  const response = await fetch(apiUrl(path), {
    ...rest,
    body,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    clearStoredToken();
    throw new ApiError(
      (data as { message?: string }).message || "未登录或登录已过期",
      401
    );
  }

  if (!response.ok) {
    throw new ApiError(
      (data as { message?: string }).message || "请求失败",
      response.status
    );
  }

  return data as T;
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export function getErrorMessage(error: unknown, fallback = "请求失败"): string {
  if (error instanceof TypeError) {
    return "无法连接服务器";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
