import API from "./axios";

export const getCurrentUser = () => {
  return API.get("/users/me");
};