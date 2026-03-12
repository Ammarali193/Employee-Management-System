const API = "http://localhost:5000/api/shifts";

export const getShifts = async () => {
  const res = await fetch(API);
  return res.json();
};

export const createShift = async (data) => {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const updateShift = async (id, data) => {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const deleteShift = async (id) => {
  await fetch(`${API}/${id}`, { method: "DELETE" });
};

const shiftService = {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
};

export default shiftService;
