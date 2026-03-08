import { axiosClient } from "./axiosClient";

export const userService = {
  getProfile: () => {
    return axiosClient.get("/v1/users/me");
  },
};