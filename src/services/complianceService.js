import api from "./api";

const getPolicies = async () => {
  const res = await api.get("/compliance/policies");
  return res.data;
};

const createPolicy = async (data) => {
  const res = await api.post("/compliance/policies", data);
  return res.data;
};

const getAuditLogs = async () => {
  const res = await api.get("/audit/logs");
  return res.data;
};

const getComplianceReport = async () => {
  const res = await api.get("/compliance/report");
  return res.data;
};

const complianceService = {
  getPolicies,
  createPolicy,
  getAuditLogs,
  getComplianceReport,
};

export default complianceService;
