import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined"
      ? "http://localhost:5000/api"
      : process.env.API_URL || "http://localhost:5000/api"),
});

const resolveToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const candidates = [
    localStorage.getItem("token"),
    localStorage.getItem("accessToken"),
    sessionStorage.getItem("token"),
    sessionStorage.getItem("accessToken"),
  ];

  for (const candidate of candidates) {
    const token = String(candidate || "")
      .trim()
      .replace(/^"|"$/g, "")
      .replace(/^Bearer\s+/i, "");

    if (token && token !== "null" && token !== "undefined") {
      return token;
    }
  }

  return null;
};

api.interceptors.request.use((config) => {
  const token = resolveToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

