import React, { useEffect, useState, useContext } from "react";
import { View, Text, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getCurrentUser } from "../api/userApi";
import { AuthContext } from "../context/AuthContext";

export default function DashboardScreen() {

  const [user, setUser] = useState(null);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res = await getCurrentUser();
      setUser(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  // ✅ LOGOUT
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    logout(); // 🔥 triggers navigator switch
  };

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>

      <Text>Welcome</Text>

      {user && (
        <>
          <Text>{user.name}</Text>
          <Text>Flat: {user.flatNumber}</Text>
        </>
      )}

      <Button title="Logout" onPress={handleLogout} />

    </View>
  );
}