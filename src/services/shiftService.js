import api from "./api";

const getShifts = async () => {
  const res = await api.get("/shifts");
  return res.data;
};

const createShift = async (shift) => {
  const res = await api.post("/shifts", shift);
  return res.data;
};

const updateShift = async (id, shift) => {
  const res = await api.put(`/shifts/${id}`, shift);
  return res.data;
};

const deleteShift = async (id) => {
  const res = await api.delete(`/shifts/${id}`);
  return res.data;
};

const shiftService = {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
};

export default shiftService;

