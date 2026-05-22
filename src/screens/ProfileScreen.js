import React, { useContext } from "react";
import { View, Text, Button } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function ProfileScreen() {

  const { logout } = useContext(AuthContext);

  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <Text>Profile Screen</Text>

      <Button title="Logout" onPress={logout} />
    </View>
  );
}