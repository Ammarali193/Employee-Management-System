import api from "./api";

const getPolicies = async () => {
const res = await api.get("/api/compliance/policies");
  return res.data;
};

const createPolicy = async (data) => {
const res = await api.post("/api/compliance/policies", data);
  return res.data;
};

const getAuditLogs = async () => {
const res = await api.get("/api/audit/logs");
  return res.data;
};

const getComplianceReport = async () => {
const res = await api.get("/api/compliance/report");
  return res.data;
};

const complianceService = {
  getPolicies,
  createPolicy,
  getAuditLogs,
  getComplianceReport,
};

export default complianceService;
