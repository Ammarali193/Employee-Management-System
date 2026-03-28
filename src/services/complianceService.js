import api from "./api";

const unwrap = (payload) => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload;
};

const getPolicies = async () => {
  const res = await api.get("/compliance/policies");
  return unwrap(res.data);
};

const createPolicy = async (data) => {
  const res = await api.post("/compliance/policies", data);
  return unwrap(res.data);
};

const getAuditLogs = async () => {
  const res = await api.get("/audit-logs");
  return unwrap(res.data);
};

const getComplianceReport = async () => {
  const res = await api.get("/reports/leave");
  return unwrap(res.data);
};

const complianceService = {
  getPolicies,
  createPolicy,
  getAuditLogs,
  getComplianceReport,
};

export default complianceService;
