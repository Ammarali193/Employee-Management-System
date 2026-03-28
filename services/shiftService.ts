type ShiftPayload = {
  name: string;
  start_time: string;
  end_time: string;
};

type AssignmentPayload = {
  employee_id: number;
  shift_id: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
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

const shiftService = {
  getShifts: () => request("/shifts"),
  getAssignments: () => request("/shifts/assignments"),
  createShift: (data: ShiftPayload) => request("/shifts", { method: "POST", body: JSON.stringify(data) }),
  assignShift: (data: AssignmentPayload) =>
    request("/shifts/assign", { method: "POST", body: JSON.stringify(data) }),
};

export default shiftService;
