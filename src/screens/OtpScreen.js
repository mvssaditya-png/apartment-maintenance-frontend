import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { verifyOtp } from "../api/authApi";
import { AuthContext } from "../context/AuthContext";

export default function OtpScreen({ route }) {

  const { phoneNumber } = route.params;
  const { login } = useContext(AuthContext);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // ----------------------------
  // VERIFY OTP
  // ----------------------------
  const handleVerifyOtp = async () => {

    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter 6 digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyOtp(phoneNumber, otp);

      /**
       * SUCCESS RESPONSE:
       * {
       *   token,
       *   userId,
       *   message
       * }
       */

      const token = response.data.token;

      // ✅ Save JWT
      await AsyncStorage.setItem("token", token);

      // ✅ Update global auth state
      login(token);

      // 🚀 Navigator automatically moves to Dashboard

    } catch (error) {

      console.log("VERIFY OTP ERROR:", error?.response?.data);

      if (error.response?.status === 403) {
        Alert.alert("Error", "Invalid OTP");
      } else {
        Alert.alert("Error", "Server not reachable");
      }

    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // UI
  // ----------------------------
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>

        <Text style={styles.title}>Verify OTP</Text>

        <Text style={styles.subtitle}>
          OTP sent to {phoneNumber}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter 6 digit OTP"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleVerifyOtp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}


// ----------------------------
// STYLES
// ----------------------------
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#f2f4f8",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 12,
    elevation: 5,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
    letterSpacing: 8,
    textAlign: "center",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});