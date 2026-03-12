import api from \"./api\";

const getAttendance = async () => {
  const res = await api.get(\"/attendance\");
  return res.data;
};

const getStats = async () => {
  const res = await api.get(\"/attendance/stats\");
  return res.data;
};

const checkIn = async () => {
  const res = await api.post(\"/attendance/checkin\");
  return res.data;
};

const checkOut = async () => {
  const res = await api.post(\"/attendance/checkout\");
  return res.data;
};

const getMyAttendance = async () => {
  const employeeId = localStorage.getItem(\"employee_id\") || 4;
  const res = await api.get(`/attendance/my?employee_id=${employeeId}`);
  return res.data;
};

const attendanceService = {
  getAttendance,
  getStats,
  checkIn,
  checkOut,
  getMyAttendance,
};

export default attendanceService;

