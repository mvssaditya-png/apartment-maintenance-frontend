import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveAuth = async (token, userId) => {
  await AsyncStorage.setItem("authToken", token);
  await AsyncStorage.setItem("userId", userId);
};

export const getToken = async () => {
  return await AsyncStorage.getItem("authToken");
};

export const logout = async () => {
  await AsyncStorage.removeItem("authToken");
  await AsyncStorage.removeItem("userId");
};