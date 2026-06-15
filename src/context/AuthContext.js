import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { setLogoutHandler } from "../api/axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (token, role) => {
    try {
      await AsyncStorage.setItem("token", token);

      if (role) {
        await AsyncStorage.setItem("role", role);
      }

      setUserToken(token);
      setUserRole(role || null);
    } catch (error) {
      console.log("LOGIN SAVE TOKEN ERROR:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("role");

      setUserToken(null);
      setUserRole(null);
    } catch (error) {
      console.log("LOGOUT ERROR:", error);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");

      if (token) {
        setUserToken(token);
        setUserRole(role);
      } else {
        setUserToken(null);
        setUserRole(null);
      }
    } catch (error) {
      console.log("CHECK LOGIN STATUS ERROR:", error);
      setUserToken(null);
      setUserRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setLogoutHandler(logout);
    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userToken,
        userRole,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}