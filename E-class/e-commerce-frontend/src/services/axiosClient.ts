import axios from "axios";
import { authStorage } from "./auth.storage";

export const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token?: string) => {
  if (token) axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete axiosClient.defaults.headers.common["Authorization"];
};

// ✅ khi refresh trang vẫn giữ token
const savedToken = localStorage.getItem("token");
if (savedToken) setAuthToken(savedToken);

axiosClient.interceptors.request.use((config) => {
  const auth = authStorage.get();
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // Nếu backend trả 401 -> token hết hạn hoặc sai
    if (err?.response?.status === 401) {
      authStorage.clear();
      // tuỳ bạn: window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
