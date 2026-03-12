import api from "./api";

const getEmployees = async () => {
  const res = await api.get("/employees");
  return res.data;
};

const createEmployee = async (employee) => {
  const res = await api.post("/employees", employee);
  return res.data;
};

const deleteEmployee = async (id) => {
  const res = await api.delete(`/employees/${id}`);
  return res.data;
};

const updateEmployee = async (id, employee) => {
  const res = await api.put(`/employees/${id}`, employee);
  return res.data;
};

const employeeService = {
  getEmployees,
  createEmployee,
  deleteEmployee,
  updateEmployee,
};

export default employeeService;
