import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { setLogoutHandler } from "../api/axios";
import { getSubscriptionStatus } from "../api/subscriptionApi";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSubscriptionStatus = async (role) => {
    try {
      if (role === "SUPER_ADMIN") {
        setSubscriptionStatus({
          status: "SUPER_ADMIN",
          allowed: true,
          expired: false,
        });
        return;
      }

      const response = await getSubscriptionStatus();
      setSubscriptionStatus(response.data || null);
    } catch (error) {
      console.log(
        "LOAD SUBSCRIPTION STATUS ERROR:",
        error?.response?.data || error
      );

      setSubscriptionStatus(null);
    }
  };

  const login = async (token, role) => {
    try {
      await AsyncStorage.setItem("token", token);

      if (role) {
        await AsyncStorage.setItem("role", role);
      } else {
        await AsyncStorage.removeItem("role");
      }

      setUserToken(token);
      setUserRole(role || null);

      await loadSubscriptionStatus(role);
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
      setSubscriptionStatus(null);
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

        await loadSubscriptionStatus(role);
      } else {
        setUserToken(null);
        setUserRole(null);
        setSubscriptionStatus(null);
      }
    } catch (error) {
      console.log("CHECK LOGIN STATUS ERROR:", error);

      setUserToken(null);
      setUserRole(null);
      setSubscriptionStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscriptionStatus = async () => {
    await loadSubscriptionStatus(userRole);
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
        subscriptionStatus,
        isLoading,
        login,
        logout,
        refreshSubscriptionStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}