import api from "./api";

const getEmployees = async () => {
  const res = await api.get("/employees");
  return res.data;
};

const createEmployee = async (data) => {
  const res = await api.post("/employees/register", data);
  return res.data;
};

const deleteEmployee = async (id) => {
  const res = await api.delete(`/employees/${id}`);
  return res.data;
};

const employeeService = {
  getEmployees,
  createEmployee,
  deleteEmployee,
};

export default employeeService;
