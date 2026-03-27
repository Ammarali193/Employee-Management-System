import api from "./api";

const shiftService = {
  getShifts: async () => {
    const res = await api.get("/shifts", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data;
  },

  createShift: async (data) => {
    const res = await api.post("/shifts", data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return res.data;
  },
};

export default shiftService;
