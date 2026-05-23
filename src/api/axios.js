import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = axios.create({
  baseURL: "http://192.168.1.10:8080/api",
  timeout: 15000,
});

let logoutHandler = null;

export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

API.interceptors.request.use(
  async (config) => {

    console.log("Calling API:", config.baseURL + config.url);

    const token = await AsyncStorage.getItem("token");

    console.log("token***", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,

  async (error) => {

    const status = error?.response?.status;

    console.log("API ERROR STATUS:", status);

    if (status === 401 || status === 403) {

      console.log("JWT expired. Logging out...");

      await AsyncStorage.removeItem("token");

      if (logoutHandler) {
        logoutHandler();
      }
    }

    return Promise.reject(error);
  }
);

export default API;