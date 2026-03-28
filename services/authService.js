import api from "./api";

const isNotFoundError = (error) => error?.response?.status === 404;

const getTokenFromResponse = (data) => {
  const tokenCandidates = [
    data?.token,
    data?.accessToken,
    data?.jwt,
    data?.data?.token,
    data?.data?.accessToken,
    data?.data?.jwt,
    data?.user?.token,
    data?.user?.accessToken,
  ];

  return tokenCandidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim().length > 0,
  );
};

const getUserFromResponse = (data) => data?.user ?? data?.data?.user ?? null;

const normalizeAuthResponse = (data) => ({
  ...data,
  token: getTokenFromResponse(data),
  user: getUserFromResponse(data),
});

const postLogin = async (url, payload) => {
  if (process.env.NODE_ENV !== "production") {
    console.info("[auth] Login request", {
      url,
      email: payload.email,
      hasPassword: Boolean(payload.password),
      baseURL: api.defaults.baseURL,
    });
  }

  const response = await api.post(url, payload);
  const normalizedResponse = normalizeAuthResponse(response.data);

  if (process.env.NODE_ENV !== "production") {
    console.info("[auth] Login response", {
      url,
      status: response.status,
      hasToken: Boolean(normalizedResponse.token),
      keys: Object.keys(response.data ?? {}),
    });
  }

  if (!normalizedResponse.token) {
    console.error("[auth] Token missing in login response", response.data);
    throw new Error(
      "Login response received, but no token was found. Check backend response shape.",
    );
  }

  return normalizedResponse;
};

const login = async (email, password) => {
  const payload = {
    email,
    password,
  };

  return await postLogin("/auth/login", payload);
};

const authService = { login };

export default authService;
