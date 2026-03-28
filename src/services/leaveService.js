import api from "./api";

const unwrap = (payload) => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload;
};

const applyLeave = async (data) => {
  const res = await api.post("/leaves/apply", data);
  return unwrap(res.data);
};

const normalizeLeaveResponse = (data) => {
  return data.leaves ?? data.leave_requests ?? data;
};

const getMyLeaves = async () => {
  const res = await api.get("/leaves");
  return normalizeLeaveResponse(unwrap(res.data));
};

const getAllLeaves = async () => {
  const res = await api.get("/leaves");
  return normalizeLeaveResponse(unwrap(res.data));
};

const approveLeave = async (id) => {
  const res = await api.put(`/leaves/${id}`, { status: "Approved" });
  return unwrap(res.data);
};

const rejectLeave = async (id) => {
  const res = await api.put(`/leaves/${id}`, { status: "Rejected" });
  return unwrap(res.data);
};

const leaveService = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
};

export default leaveService;