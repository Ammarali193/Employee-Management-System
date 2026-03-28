import api from "./api";

const unwrap = (payload) => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload;
};

export const advancedService = {
  createShift: async (data) => unwrap((await api.post("/shifts", data)).data),
  getShifts: async () => unwrap((await api.get("/shifts")).data),
  assignShift: async (data) => unwrap((await api.post("/shifts/assign", data)).data),
  getShiftAssignments: async () => unwrap((await api.get("/shifts/assignments")).data),

  getLeaveBalance: async () => unwrap((await api.get("/leave-balance")).data),
  updateLeaveBalance: async (employeeId, data) =>
    unwrap((await api.put(`/leave-balance/${employeeId}`, data)).data),

  createHoliday: async (data) => unwrap((await api.post("/holidays", data)).data),
  getHolidays: async () => unwrap((await api.get("/holidays")).data),

  createDocument: async (formData) =>
    unwrap((await api.post("/documents", formData, { headers: { "Content-Type": "multipart/form-data" } })).data),
  getDocuments: async () => unwrap((await api.get("/documents")).data),

  getHistory: async (employeeId) => unwrap((await api.get(`/history/${employeeId}`)).data),

  getAuditLogs: async () => unwrap((await api.get("/audit-logs")).data),

  createTenant: async (data) => unwrap((await api.post("/tenants", data)).data),
  getTenants: async () => unwrap((await api.get("/tenants")).data),
};

export default advancedService;
