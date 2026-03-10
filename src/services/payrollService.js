import api from "./api";

const getPayroll = async () => {
  const res = await api.get("/payroll");

  return res.data;
};

const assignSalary = async (data) => {
  const res = await api.post("/payroll/assign", data);

  return res.data;
};

const getPayslip = async (id) => {
  const res = await api.get(`/payroll/slip/${id}?month=3&year=2026`);

  return res.data;
};

export default {
  getPayroll,
  assignSalary,
  getPayslip,
};
