import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { setLogoutHandler } from "../api/axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (token) => {
    try {
      await AsyncStorage.setItem("token", token);
      setUserToken(token);
    } catch (error) {
      console.log("LOGIN SAVE TOKEN ERROR:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setUserToken(null);
    } catch (error) {
      console.log("LOGOUT ERROR:", error);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        setUserToken(token);
      } else {
        setUserToken(null);
      }
    } catch (error) {
      console.log("CHECK LOGIN STATUS ERROR:", error);
      setUserToken(null);
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
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}