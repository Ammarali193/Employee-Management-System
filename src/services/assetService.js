import api from "./api";

const getAssets = async () => {
  const res = await api.get("/assets");

  return res.data;
};

const createAsset = async (data) => {
  const res = await api.post("/assets", data);

  return res.data;
};

const assignAsset = async (data) => {
  const res = await api.post("/assets/assign", data);

  return res.data;
};

const returnAsset = async (data) => {
  const res = await api.post("/assets/return", data);

  return res.data;
};

export default {
  getAssets,
  assignAsset,
  createAsset,
  returnAsset,
};
