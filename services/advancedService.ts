const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (typeof payload === "object" && payload && "message" in payload && String((payload as { message?: unknown }).message)) ||
      `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

const advancedService = {
  getDocuments: () => request("/documents"),
  getAuditLogs: () => request("/audit-logs"),
  createDocument: (formData: FormData) =>
    request("/documents", {
      method: "POST",
      body: formData,
    }),
};

export default advancedService;
