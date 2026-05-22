import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLoggedInUser, getExpensesExportUrl } from "../api/dashboardApi";
export default function ExpensesScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res = await getLoggedInUser();
      setUser(res.data);
    } catch (error) {
      console.log("LOAD USER ERROR:", error?.response?.data || error);
    }
  };

  const handleExportExpenses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const fileUri =
        FileSystem.documentDirectory + "expenses-report.xlsx";

      const result = await FileSystem.downloadAsync(
        getExpensesExportUrl(),
        fileUri,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (result.status !== 200) {
        Alert.alert("Error", "Unable to export expenses.");
        return;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(result.uri, {
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Share Expenses Report",
          UTI: "com.microsoft.excel.xlsx",
        });
      } else {
        Alert.alert("Downloaded", "Expenses exported successfully.");
      }
    } catch (error) {
      console.log("EXPORT EXPENSES ERROR:", error);
      Alert.alert("Error", "Unable to export expenses.");
    }
  };

  const isAdminOrCashier =
    user?.role?.toUpperCase() === "ADMIN" ||
    user?.role?.toUpperCase() === "CASHIER";
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Expenses</Text>
        <Text style={styles.subtitle}>
          Manage society expenses and receipts.
        </Text>

        {isAdminOrCashier && (
          <ExpenseCard
            icon="add-circle-outline"
            title="Add Expense"
            subtitle="Record a new society expense"
            color="#DC2626"
            bg="#FEF2F2"
            onPress={() => navigation.navigate("AddExpense")}
          />
        )}

        <ExpenseCard
          icon="eye-outline"
          title="View Expenses"
          subtitle="View recorded expenses and receipts"
          color="#2563EB"
          bg="#EEF4FF"
          onPress={() => navigation.navigate("ViewExpenses")}
        />

        {isAdminOrCashier && (
          <ExpenseCard
            icon="download-outline"
            title="Export Expenses"
            subtitle="Download expenses report in Excel"
            color="#16A34A"
            bg="#EAF8EE"
            onPress={handleExportExpenses}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ExpenseCard({ icon, title, subtitle, color, bg, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.disabledCard]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color={disabled ? "#D1D5DB" : "#9CA3AF"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  container: {
    padding: 18,
    paddingBottom: 100,
  },

  heading: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
  },

  disabledCard: {
    opacity: 0.6,
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  textBlock: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  cardSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
});