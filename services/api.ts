type ApiResponse<T = unknown> = {
  data: T;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

async function parseResponse(response: Response) {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  return isJson ? response.json() : response.text();
}

const api = {
  async get<T = unknown>(path: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      credentials: "include",
    });

    const payload = await parseResponse(response);

    if (!response.ok) {
      const message =
        typeof payload === "object" && payload !== null && "message" in payload
          ? String((payload as { message?: unknown }).message || "Request failed")
          : `Request failed: ${response.status}`;
      throw new Error(message);
    }

    return { data: payload as T };
  },
};

export default api;
