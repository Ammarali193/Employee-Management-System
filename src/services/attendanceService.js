import api from "./api";

const checkIn = async () => {
  const res = await api.post("/attendance/checkin");
  return res.data;
};

const checkOut = async () => {
  const res = await api.post("/attendance/checkout");
  return res.data;
};

const getMyAttendance = async () => {
  const res = await api.get("/attendance/my");
  return res.data;
};

const attendanceService = {
  checkIn,
  checkOut,
  getMyAttendance,
};

export default attendanceService;
