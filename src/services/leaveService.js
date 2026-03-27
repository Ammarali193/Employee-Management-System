import api from "./api";

const applyLeave = async (data) => {
const res = await api.post("/leave/apply", data);
  return res.data;
};

const normalizeLeaveResponse = (data) => {
  return data.leaves ?? data.leave_requests ?? data;
};

const getMyLeaves = async () => {
  const token = localStorage.getItem("token");
  const endpoints = ["/leave/my"]; // FIXED

  for (const endpoint of endpoints) {
    try {
      const res = await api.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return normalizeLeaveResponse(res.data);
    } catch (error) {
      // try next endpoint
    }
  }

  throw new Error("Unable to fetch user leave requests");
};

const getAllLeaves = async () => {
  const endpoints = ["/leave/all", "/leave", "/leaves", "/leave/requests", "/leave-requests"]; // FIXED

  for (const endpoint of endpoints) {
    try {
      const res = await api.get(endpoint);
      return normalizeLeaveResponse(res.data);
    } catch (error) {
      // try next endpoint
    }
  }

  throw new Error("Unable to fetch leave requests");
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