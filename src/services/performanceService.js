import api from "./api";

const getPerformance = async () => {
  const res = await api.get("/performance");

  return res.data;
};

const addPerformance = async (data) => {
  const res = await api.post("/performance/add", data);

  return res.data;
};

const getTopPerformers = async () => {
  const res = await api.get("/performance/top");

  return res.data;
};

export default {
  getPerformance,
  addPerformance,
  getTopPerformers,
};
