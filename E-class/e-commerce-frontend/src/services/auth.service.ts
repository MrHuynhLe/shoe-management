import { axiosClient } from "./axiosClient";

export const authService = {
  login: async (payload: { usernameOrEmail: string; password: string }) => {
    const res = await axiosClient.post("/auth/login", payload); // ✅ sửa ở đây
    return res.data;
  },
}