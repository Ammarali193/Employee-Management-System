import api from "./api";

const applyLeave = async (data) => {
  const res = await api.post("/leave/apply", data);
  return res.data;
};

const getMyLeaves = async () => {
  const token = localStorage.getItem("token");
  const res = await api.get("/leaves/my", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.leaves;
};

const getAllLeaves = async () => {
  const res = await api.get("/leaves");
  return res.data.leaves ?? res.data.leave_requests ?? res.data;
};

const approveLeave = async (id) => {
  const res = await api.put(`/leave/approve/${id}`);
  return res.data;
};

const rejectLeave = async (id) => {
  const res = await api.put(`/leave/reject/${id}`);
  return res.data;
};

const leaveService = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
};

export default leaveService;
