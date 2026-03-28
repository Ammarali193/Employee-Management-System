import api from "./api";

const unwrap = (payload) => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload;
};

const getAttendanceReport = async () => unwrap((await api.get("/reports/attendance")).data);
const getPayrollReport = async () => unwrap((await api.get("/reports/payroll")).data);
const getLeaveReport = async () => unwrap((await api.get("/reports/leave")).data);

const getKpis = async () => unwrap((await api.get("/kpi")).data);
const createKpi = async (payload) => unwrap((await api.post("/kpi", payload)).data);

const getFeedback = async () => unwrap((await api.get("/feedback")).data);
const createFeedback = async (payload) => unwrap((await api.post("/feedback", payload)).data);

const getAppraisal = async () => unwrap((await api.get("/appraisal")).data);

const getCompliancePolicies = async () => unwrap((await api.get("/compliance/policies")).data);
const createCompliancePolicy = async (payload) => unwrap((await api.post("/compliance/policies", payload)).data);

const getJobs = async () => unwrap((await api.get("/jobs")).data);
const createJob = async (payload) => unwrap((await api.post("/jobs", payload)).data);

const getCandidates = async () => unwrap((await api.get("/candidates")).data);
const createCandidate = async (payload) => unwrap((await api.post("/candidates", payload)).data);

const getOnboarding = async () => unwrap((await api.get("/onboarding")).data);
const createOnboarding = async (payload) => unwrap((await api.post("/onboarding", payload)).data);

const getExitRequests = async () => unwrap((await api.get("/exit")).data);
const createExitRequest = async (payload) => unwrap((await api.post("/exit", payload)).data);

const adminService = {
  getAttendanceReport,
  getPayrollReport,
  getLeaveReport,
  getKpis,
  createKpi,
  getFeedback,
  createFeedback,
  getAppraisal,
  getCompliancePolicies,
  createCompliancePolicy,
  getJobs,
  createJob,
  getCandidates,
  createCandidate,
  getOnboarding,
  createOnboarding,
  getExitRequests,
  createExitRequest,
};

export default adminService;
