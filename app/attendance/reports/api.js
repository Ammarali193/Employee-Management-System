import api from "@/services/api";

export const getAttendanceReports = async () => {
  const response = await api.get("/attendance/reports");
  const payload = response.data;

  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload;
};
