import api from "./api";

const applyLeave = async (data) => {
  const res = await api.post("/leave/apply", data);
  return res.data;
};

const getMyLeaves = async () => {
  const res = await api.get("/leave/all");
  return res.data;
};

const approveLeave = async (id) => {
  const res = await api.put(`/leave/approve/${id}`);
  return res.data;
};

const rejectLeave = async (id) => {
  const res = await api.put(`/leave/reject/${id}`);
  return res.data;
};

export default {
  applyLeave,
  getMyLeaves,
  approveLeave,
  rejectLeave,
};
