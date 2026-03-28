import api from "./api";

const unwrap = (payload) => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload;
};

const shiftService = {
  getShifts: async () => {
    const res = await api.get("/shifts");
    return unwrap(res.data);
  },

  createShift: async (data) => {
    const res = await api.post("/shifts", data);
    return unwrap(res.data);
  },

  assignShift: async (data) => {
    const res = await api.post("/shifts/assign", data);
    return unwrap(res.data);
  },

  getAssignments: async () => {
    const res = await api.get("/shifts/assignments");
    return unwrap(res.data);
  },
};

export default shiftService;
