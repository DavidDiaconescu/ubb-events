/**
 * Minimal HTTP client for the Spring Boot backend.
 * Sends the JWT from the current session and turns RFC 9457 problem details into {@link ApiError}s.
 */

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, "");
const TOKEN_KEY = "ubb-events/token";

/** A request the backend rejected; {@code message} can be shown to the user. */
export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

let accessToken: string | null | undefined;

export function getToken(): string | null {
  if (accessToken === undefined) {
    try {
      accessToken = window.localStorage.getItem(TOKEN_KEY);
    } catch {
      accessToken = null;
    }
  }
  return accessToken;
}

export function setToken(token: string | null): void {
  accessToken = token;
  try {
    if (token === null) window.localStorage.removeItem(TOKEN_KEY);
    else window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Without storage the session only lasts until the page is reloaded.
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T = void>(method: Method, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(`The server cannot be reached (${API_URL}). Is the backend running?`, 0);
  }

  if (!response.ok) {
    throw new ApiError(await errorMessage(response), response.status);
  }
  // Read the body as text: an empty 200 response (e.g. chunked, without Content-Length) is not valid JSON.
  const text = await response.text();
  if (text === "") return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError("The server sent a response that could not be read.", response.status);
  }
}

export const api = {
  get: <T>(path: string) => apiRequest<T>("GET", path),
  post: <T = void>(path: string, body?: unknown) => apiRequest<T>("POST", path, body),
  put: <T = void>(path: string, body?: unknown) => apiRequest<T>("PUT", path, body),
  patch: <T = void>(path: string, body?: unknown) => apiRequest<T>("PATCH", path, body),
  delete: (path: string) => apiRequest("DELETE", path),
};

async function errorMessage(response: Response): Promise<string> {
  try {
    const problem = (await response.json()) as { detail?: string; errors?: Record<string, string> };
    // Bean-validation failures carry the message of each invalid field in "errors".
    const fieldErrors = problem.errors ? Object.entries(problem.errors) : [];
    if (fieldErrors.length > 0) {
      return fieldErrors.map(([field, message]) => `${field}: ${message}`).join("; ");
    }
    if (problem.detail) return problem.detail;
  } catch {
    // Not a problem-detail body; fall through to the generic message.
  }
  return `The request failed (HTTP ${response.status}).`;
}
