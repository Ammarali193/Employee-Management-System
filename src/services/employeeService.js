// import api from "./api";

// const EMPLOYEE_API = "/api/employees";
// const LEGACY_ADD_EMPLOYEE_API = "/api/add-employee";

// const isNotFoundError = (error) => error?.response?.status === 404;

// const isRecord = (value) =>
//   value !== null && typeof value === "object" && !Array.isArray(value);

// const normalizeEmployee = (employee) => {
//   if (!isRecord(employee)) {
//     return employee;
//   }

//   const firstName = employee.first_name ?? employee.firstName ?? "";
//   const lastName = employee.last_name ?? employee.lastName ?? "";
//   const workType = employee.workType ?? employee.work_type ?? null;
//   const remoteAllowed =
//     employee.remoteAllowed ??
//     employee.remote_allowed ??
//     employee.allow_remote ??
//     employee.is_remote ??
//     employee.isRemote;

//   const normalizedEmployee = {
//     ...employee,
//     first_name: firstName,
//     last_name: lastName,
//   };

//   if (!normalizedEmployee.name) {
//     const fullName = `${firstName} ${lastName}`.trim();

//     if (fullName) {
//       normalizedEmployee.name = fullName;
//     }
//   }

//   if (workType !== null && workType !== undefined) {
//     normalizedEmployee.workType = workType;
//   }

//   if (remoteAllowed !== undefined) {
//     normalizedEmployee.remoteAllowed = Boolean(remoteAllowed);
//   }

//   return normalizedEmployee;
// };

// const normalizeEmployeeResponse = (payload) => {
//   if (Array.isArray(payload)) {
//     return payload.map(normalizeEmployee);
//   }

//   if (!isRecord(payload)) {
//     return payload;
//   }

//   if (Array.isArray(payload.employees)) {
//     return {
//       ...payload,
//       employees: payload.employees.map(normalizeEmployee),
//     };
//   }

//   if (isRecord(payload.employee)) {
//     return {
//       ...payload,
//       employee: normalizeEmployee(payload.employee),
//     };
//   }

//   return normalizeEmployee(payload);
// };

// const toEmployeePayload = (employee = {}) => {
//   if (!isRecord(employee)) {
//     return employee;
//   }

//   const payload = { ...employee };

//   if ("firstName" in payload && !("first_name" in payload)) {
//     payload.first_name = payload.firstName;
//   }

//   if ("lastName" in payload && !("last_name" in payload)) {
//     payload.last_name = payload.lastName;
//   }

//   if ("shiftId" in payload && !("shift_id" in payload)) {
//     payload.shift_id = payload.shiftId;
//   }

//   if ("departmentId" in payload && !("department_id" in payload)) {
//     payload.department_id = payload.departmentId;
//   }

//   // Frontend keeps using workType; the API can safely receive work_type.
//   if ("workType" in payload && !("work_type" in payload)) {
//     payload.work_type = payload.workType;
//   }

//   if ("remoteAllowed" in payload && !("remote_allowed" in payload)) {
//     payload.remote_allowed = payload.remoteAllowed;
//   }

//   if ("isRemote" in payload && !("is_remote" in payload)) {
//     payload.is_remote = payload.isRemote;
//   }

//   delete payload.firstName;
//   delete payload.lastName;
//   delete payload.shiftId;
//   delete payload.departmentId;
//   delete payload.workType;
//   delete payload.remoteAllowed;
//   delete payload.isRemote;

//   if (payload.password === "") {
//     delete payload.password;
//   }

//   return payload;
// };

// const toLegacyEmployeePayload = (employee = {}) => {
//   const payload = toEmployeePayload(employee);

//   if (!isRecord(payload)) {
//     return payload;
//   }

//   const firstName = payload.first_name ?? "";
//   const lastName = payload.last_name ?? "";
//   const fullName = `${firstName} ${lastName}`.trim();

//   return {
//     ...payload,
//     name: payload.name ?? fullName,
//     workType:
//       employee.workType ?? employee.work_type ?? payload.work_type ?? "office",
//   };
// };

// export const getEmployees = async () => {
//   const res = await api.get(EMPLOYEE_API);
//   const payload = normalizeEmployeeResponse(res.data);

//   if (Array.isArray(payload)) {
//     return payload;
//   }

//   if (Array.isArray(payload?.employees)) {
//     return payload.employees;
//   }

//   return [];
// };

// export const getEmployee = async (id) => {
//   const res = await api.get(`${EMPLOYEE_API}/${id}`);
//   const payload = normalizeEmployeeResponse(res.data);

//   return payload?.employee ?? payload;
// };

// export const addEmployee = async (data) => {
//   try {
//     const res = await api.post(EMPLOYEE_API, toEmployeePayload(data));

//     return normalizeEmployeeResponse(res.data);
//   } catch (error) {
//     if (!isNotFoundError(error)) {
//       throw error;
//     }

//     const res = await api.post(LEGACY_ADD_EMPLOYEE_API, toLegacyEmployeePayload(data));

//     return normalizeEmployeeResponse(res.data);
//   }
// };

// export const createEmployee = addEmployee;

// export const updateEmployee = async (id, data) => {
//   const res = await api.put(`${EMPLOYEE_API}/${id}`, toEmployeePayload(data));

//   return normalizeEmployeeResponse(res.data);
// };

// export const deleteEmployee = async (id) => {
//   const res = await api.delete(`${EMPLOYEE_API}/${id}`);

//   return res.data;
// };

// export const allowRemote = async (id) => {
//   const res = await api.put(`${EMPLOYEE_API}/${id}/allow-remote`);

//   return normalizeEmployeeResponse(res.data);
// };

// const employeeService = {
//   addEmployee,
//   allowRemote,
//   createEmployee,
//   deleteEmployee,
//   getEmployee,
//   getEmployees,
//   updateEmployee,
// };

// export default employeeService;

import api from "./api";

// ✅ FIXED (removed /api)
const EMPLOYEE_API = "/employees";
const LEGACY_ADD_EMPLOYEE_API = "/add-employee";

const isNotFoundError = (error) => error?.response?.status === 404;

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const removeUndefinedValues = (value) => {
  if (!isRecord(value)) {
    return value;
  }

  const entries = Object.entries(value).filter(([, item]) => item !== undefined);
  return Object.fromEntries(entries);
};

const normalizeEmployee = (employee) => {
  if (!isRecord(employee)) {
    return employee;
  }

  const firstName = employee.first_name ?? employee.firstName ?? "";
  const lastName = employee.last_name ?? employee.lastName ?? "";
  const workType = employee.workType ?? employee.work_type ?? null;
  const remoteAllowed =
    employee.remoteAllowed ??
    employee.remote_allowed ??
    employee.allow_remote ??
    employee.is_remote ??
    employee.isRemote;

  const normalizedEmployee = {
    ...employee,
    first_name: firstName,
    last_name: lastName,
  };

  if (!normalizedEmployee.name) {
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
      normalizedEmployee.name = fullName;
    }
  }

  if (workType !== null && workType !== undefined) {
    normalizedEmployee.workType = workType;
  }

  if (remoteAllowed !== undefined) {
    normalizedEmployee.remoteAllowed = Boolean(remoteAllowed);
  }

  return normalizedEmployee;
};

const normalizeEmployeeResponse = (payload) => {
  // Support unified backend response: { success, data, message }
  if (isRecord(payload) && "data" in payload) {
    return normalizeEmployeeResponse(payload.data);
  }

  if (Array.isArray(payload)) {
    return payload.map(normalizeEmployee);
  }

  if (!isRecord(payload)) {
    return payload;
  }

  if (Array.isArray(payload.employees)) {
    return {
      ...payload,
      employees: payload.employees.map(normalizeEmployee),
    };
  }

  if (isRecord(payload.employee)) {
    return {
      ...payload,
      employee: normalizeEmployee(payload.employee),
    };
  }

  return normalizeEmployee(payload);
};

const toEmployeePayload = (employee = {}) => {
  if (!isRecord(employee)) {
    return employee;
  }

  const payload = { ...employee };

  if ("firstName" in payload && !("first_name" in payload)) {
    payload.first_name = payload.firstName;
  }

  if ("lastName" in payload && !("last_name" in payload)) {
    payload.last_name = payload.lastName;
  }

  if ("shiftId" in payload && !("shift_id" in payload)) {
    payload.shift_id = payload.shiftId;
  }

  if ("departmentId" in payload && !("department_id" in payload)) {
    payload.department_id = payload.departmentId;
  }

  if ("workType" in payload && !("work_type" in payload)) {
    payload.work_type = payload.workType;
  }

  if ("remoteAllowed" in payload && !("remote_allowed" in payload)) {
    payload.remote_allowed = payload.remoteAllowed;
  }

  if ("isRemote" in payload && !("is_remote" in payload)) {
    payload.is_remote = payload.isRemote;
  }

  if (!("name" in payload) || !String(payload.name || "").trim()) {
    const first = String(payload.first_name ?? "").trim();
    const last = String(payload.last_name ?? "").trim();
    const fullName = `${first} ${last}`.trim();

    if (fullName) {
      payload.name = fullName;
    }
  }

  delete payload.firstName;
  delete payload.lastName;
  delete payload.shiftId;
  delete payload.departmentId;
  delete payload.workType;
  delete payload.remoteAllowed;
  delete payload.isRemote;

  if (payload.password === "") {
    delete payload.password;
  }

  return payload;
};

const toLegacyEmployeePayload = (employee = {}) => {
  const payload = toEmployeePayload(employee);

  if (!isRecord(payload)) {
    return payload;
  }

  const firstName = payload.first_name ?? "";
  const lastName = payload.last_name ?? "";
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    ...payload,
    name: payload.name ?? fullName,
    workType:
      employee.workType ?? employee.work_type ?? payload.work_type ?? "office",
  };
};

const toEmployeeUpdatePayload = (employee = {}) => {
  if (!isRecord(employee)) {
    return employee;
  }

  const payload = { ...employee };

  if ("first_name" in payload && !("firstName" in payload)) {
    payload.firstName = payload.first_name;
  }

  if ("last_name" in payload && !("lastName" in payload)) {
    payload.lastName = payload.last_name;
  }

  if ("shiftId" in payload && !("shift_id" in payload)) {
    payload.shift_id = payload.shiftId;
  }

  delete payload.first_name;
  delete payload.last_name;
  delete payload.name;
  delete payload.shift;
  delete payload.shiftId;

  if (payload.password === "") {
    delete payload.password;
  }

  return removeUndefinedValues(payload);
};

export const getEmployees = async () => {
  const res = await api.get(EMPLOYEE_API);
  const payload = normalizeEmployeeResponse(res.data);

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.employees)) {
    return payload.employees;
  }

  return [];
};

export const getEmployee = async (id) => {
  const res = await api.get(`${EMPLOYEE_API}/${id}`);
  const payload = normalizeEmployeeResponse(res.data);

  return payload?.employee ?? payload;
};

export const addEmployee = async (data) => {
  try {
    const res = await api.post(EMPLOYEE_API, toEmployeePayload(data));
    return normalizeEmployeeResponse(res.data);
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }

    const res = await api.post(
      LEGACY_ADD_EMPLOYEE_API,
      toLegacyEmployeePayload(data)
    );

    return normalizeEmployeeResponse(res.data);
  }
};

export const createEmployee = addEmployee;

export const updateEmployee = async (id, data) => {
  const res = await api.put(`${EMPLOYEE_API}/${id}`, toEmployeeUpdatePayload(data));
  return normalizeEmployeeResponse(res.data);
};

export const deleteEmployee = async (id) => {
  const res = await api.delete(`${EMPLOYEE_API}/${id}`);
  return res.data;
};

export const allowRemote = async (id) => {
  const res = await api.put(`${EMPLOYEE_API}/${id}/allow-remote`);
  return normalizeEmployeeResponse(res.data);
};

const employeeService = {
  addEmployee,
  allowRemote,
  createEmployee,
  deleteEmployee,
  getEmployee,
  getEmployees,
  updateEmployee,
};

export default employeeService;