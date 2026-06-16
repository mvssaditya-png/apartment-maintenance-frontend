import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
} from "../api/superAdminApi";
export default function CreatePlanScreen({ route, navigation }) {
  const editingPlan = route.params?.plan || null;

  const [minFlats, setMinFlats] = useState(
    editingPlan?.minFlats ? String(editingPlan.minFlats) : ""
  );
  const [maxFlats, setMaxFlats] = useState(
    editingPlan?.maxFlats ? String(editingPlan.maxFlats) : ""
  );
  const [durationMonths, setDurationMonths] = useState(
    editingPlan?.durationMonths ? String(editingPlan.durationMonths) : ""
  );
  const [amount, setAmount] = useState(
    editingPlan?.amount ? String(editingPlan.amount) : ""
  );
  const [active, setActive] = useState(editingPlan?.active ?? true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!minFlats || Number(minFlats) <= 0) {
      Alert.alert("Validation", "Enter valid minimum flats.");
      return;
    }

    if (maxFlats && Number(maxFlats) < Number(minFlats)) {
      Alert.alert("Validation", "Max flats cannot be less than min flats.");
      return;
    }

    if (!durationMonths || Number(durationMonths) <= 0) {
      Alert.alert("Validation", "Enter valid duration months.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      Alert.alert("Validation", "Enter valid amount.");
      return;
    }

    const payload = {
      minFlats: Number(minFlats),
      maxFlats: maxFlats ? Number(maxFlats) : null,
      durationMonths: Number(durationMonths),
      amount: Number(amount),
      active,
    };

    try {
      setLoading(true);

      if (editingPlan) {
        await updateSubscriptionPlan(editingPlan.planId, payload);
        Alert.alert("Success", "Plan updated successfully.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      } else {
        await createSubscriptionPlan(payload);
        Alert.alert("Success", "Plan created successfully.", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.log("SAVE PLAN ERROR:", error?.response?.data || error);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Unable to save plan."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <View style={styles.iconBox}>
            <Ionicons name="card-outline" size={34} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>
            {editingPlan ? "Edit Plan" : "Create Plan"}
          </Text>

          <Text style={styles.subtitle}>
            Configure pricing based on apartment flat count and duration.
          </Text>
        </View>

        <View style={styles.card}>
          <Field
            label="Minimum Flats"
            placeholder="Example: 1"
            keyboardType="numeric"
            value={minFlats}
            onChangeText={(text) => setMinFlats(text.replace(/[^0-9]/g, ""))}
          />

          <Field
            label="Maximum Flats"
            placeholder="Example: 20 or leave blank for unlimited"
            keyboardType="numeric"
            value={maxFlats}
            onChangeText={(text) => setMaxFlats(text.replace(/[^0-9]/g, ""))}
          />

          <Field
            label="Duration Months"
            placeholder="Example: 6 or 12"
            keyboardType="numeric"
            value={durationMonths}
            onChangeText={(text) =>
              setDurationMonths(text.replace(/[^0-9]/g, ""))
            }
          />

          <Field
            label="Amount"
            placeholder="Example: 1999"
            keyboardType="numeric"
            value={amount}
            onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))}
          />

          <TouchableOpacity
            style={[styles.activeBox, active ? styles.activeOn : styles.activeOff]}
            onPress={() => setActive((prev) => !prev)}
            activeOpacity={0.85}
            >
            <Ionicons
                name={active ? "checkmark-circle-outline" : "close-circle-outline"}
                size={23}
                color={active ? "#16A34A" : "#DC2626"}
            />

            <Text
                style={[
                styles.activeText,
                active ? styles.activeTextOn : styles.activeTextOff,
                ]}
            >
                {active ? "Active Plan" : "Inactive Plan"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.saveButtonText}>
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </Text>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={21}
                  color="#FFFFFF"
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
}) {
  return (
    <View style={styles.fieldBox}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  container: {
    padding: 18,
    paddingBottom: 50,
  },

  headerCard: {
    backgroundColor: "#2563EB",
    borderRadius: 28,
    padding: 24,
    marginBottom: 22,
  },

  iconBox: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  subtitle: {
    fontSize: 14,
    color: "#DBEAFE",
    marginTop: 8,
    lineHeight: 21,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  fieldBox: {
    marginBottom: 15,
  },

  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 15 : 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#F9FAFB",
    fontWeight: "600",
  },

  activeBox: {
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  activeOn: {
    backgroundColor: "#DCFCE7",
  },

  activeOff: {
    backgroundColor: "#FEE2E2",
  },

  activeText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "900",
  },

  activeTextOn: {
    color: "#16A34A",
  },

  activeTextOff: {
    color: "#DC2626",
  },

  saveButton: {
    backgroundColor: "#2563EB",
    borderRadius: 18,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginRight: 8,
  },
});