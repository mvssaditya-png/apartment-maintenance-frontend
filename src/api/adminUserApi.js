import API from "./axios";

export const getUsersBySite = async (siteId) => {
  console.log("ADMIN USERS API SITE ID:", siteId);

  const response = await API.get(`/admin/users/site/${siteId}`);

  console.log("ADMIN USERS API RESPONSE:", response.data);

  return response.data;
};

export const createUser = async (data) => {
  console.log("CREATE USER PAYLOAD:", data);

  const response = await API.post("/admin/users", data);

  console.log("CREATE USER RESPONSE:", response.data);

  return response.data;
};

export const updateUser = async (userId, data) => {
  console.log("UPDATE USER ID:", userId);
  console.log("UPDATE USER PAYLOAD:", data);

  const response = await API.put(`/admin/users/${userId}`, data);

  console.log("UPDATE USER RESPONSE:", response.data);

  return response.data;
};

export const getOwnersBySite = async (siteId) => {
  console.log("GET OWNERS SITE ID:", siteId);

  const response = await API.get(`/admin/users/site/${siteId}/owners`);

  console.log("GET OWNERS RESPONSE:", response.data);

  return response.data;
};