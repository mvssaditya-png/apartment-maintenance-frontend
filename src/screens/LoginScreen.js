import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { sendOtp } from "../api/authApi";
import { SafeAreaView } from "react-native-safe-area-context";
export default function LoginScreen({ navigation }) {

  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  // -------------------------
  // SEND OTP
  // -------------------------
  const handleSendOtp = async () => {

    if (mobile.length !== 10) {
      alert("Please enter valid 10 digit mobile number");
      return;
    }

    try {
      setLoading(true);

      const response = await sendOtp(mobile);

      if (response.data.success) {
        navigation.navigate("Otp", {
          phoneNumber: mobile,
        });
      } else {
        alert(response.data.message);
      }

    } catch (error) {
      console.log("API ERROR:", error);
      alert("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };
  /*const handleSendOtp = async () => {

  try {

    const res = await fetch(
      "http://192.168.1.13:8080/api/auth/test"
    );

    const data = await res.text();

    console.log("FETCH RESULT:", data);

  } catch (e) {
    console.log("FETCH FAILED:", e);
  }

};*/

  // -------------------------
  // UI
  // -------------------------
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.card}>

          <Text style={styles.title}>Apartment App</Text>

          <Text style={styles.subtitle}>
            Login using Mobile Number
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter Mobile Number"
            keyboardType="phone-pad"
            maxLength={10}
            value={mobile}
            onChangeText={(text) =>
              setMobile(text.replace(/[^0-9]/g, ""))
            }
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// -------------------------
// STYLES
// -------------------------
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
    fontSize: 26,
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
    padding: 12,
    fontSize: 16,
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