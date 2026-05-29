import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { LanguageContext } from "../context/LanguageContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getLoggedInUser,
  getExpensesExportUrl,
} from "../api/dashboardApi";

import AppCard from "../components/common/AppCard";
import { COLORS } from "../components/common/theme";

import { t } from "../i18n";

export default function ExpensesScreen({
  navigation,
}) {
  const { language } = useContext(LanguageContext);
  const [user, setUser] =
    useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res =
        await getLoggedInUser();

      setUser(res.data);
    } catch (error) {
      console.log(
        "LOAD USER ERROR:",
        error?.response?.data ||
          error
      );
    }
  };

  const handleExportExpenses =
    async () => {
      try {
        const token =
          await AsyncStorage.getItem(
            "token"
          );

        const fileUri =
          FileSystem.documentDirectory +
          "expenses-report.xlsx";

        const result =
          await FileSystem.downloadAsync(
            getExpensesExportUrl(),
            fileUri,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (
          result.status !== 200
        ) {
          Alert.alert(
            t("common.error"),
            t("expenses.exportFailed")
          );

          return;
        }

        if (
          await Sharing.isAvailableAsync()
        ) {
          await Sharing.shareAsync(
            result.uri,
            {
              mimeType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

              dialogTitle:
                t("expenses.shareReport"),

              UTI:
                "com.microsoft.excel.xlsx",
            }
          );
        } else {
          Alert.alert(
            t("expenses.downloaded"),
            t("expenses.exportSuccess")
          );
        }
      } catch (error) {
        console.log(
          "EXPORT EXPENSES ERROR:",
          error
        );

        Alert.alert(
          t("common.error"),
          t("expenses.exportFailed")
        );
      }
    };

  const isAdminOrCashier =
    user?.role?.toUpperCase() ===
      "ADMIN" ||
    user?.role?.toUpperCase() ===
      "CASHIER";

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.headerCard
          }
        >
          <Ionicons
            name="wallet-outline"
            size={42}
            color="#FFFFFF"
          />

          <Text
            style={styles.heading}
          >
            {t("expenses.title")}
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            {t("expenses.subtitle")}
          </Text>
        </View>

        <Text
          style={
            styles.sectionTitle
          }
        >
          {t("expenses.management")}
        </Text>

        {isAdminOrCashier && (
          <ExpenseCard
            icon="add-circle-outline"
            title={t("expenses.addExpense")}
            subtitle={t("expenses.addExpenseSubtitle")}
            color="#DC2626"
            bg="#FEF2F2"
            onPress={() =>
              navigation.navigate(
                "AddExpense"
              )
            }
          />
        )}

        <ExpenseCard
          icon="eye-outline"
          title={t("expenses.viewExpenses")}
          subtitle={t("expenses.viewExpensesSubtitle")}
          color="#2563EB"
          bg="#EEF4FF"
          onPress={() =>
            navigation.navigate(
              "ViewExpenses"
            )
          }
        />

        {isAdminOrCashier && (
          <ExpenseCard
            icon="download-outline"
            title={t("expenses.exportExpenses")}
            subtitle={t("expenses.exportExpensesSubtitle")}
            color="#16A34A"
            bg="#ECFDF5"
            onPress={
              handleExportExpenses
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ExpenseCard({
  icon,
  title,
  subtitle,
  color,
  bg,
  onPress,
  disabled,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.cardWrapper,
        disabled &&
          styles.disabledCard,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <AppCard
        style={styles.card}
      >
        <View
          style={styles.cardRow}
        >
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor:
                  bg,
              },
            ]}
          >
            <Ionicons
              name={icon}
              size={28}
              color={color}
            />
          </View>

          <View
            style={
              styles.textBlock
            }
          >
            <Text
              style={
                styles.cardTitle
              }
            >
              {title}
            </Text>

            <Text
              style={
                styles.cardSubtitle
              }
            >
              {subtitle}
            </Text>
          </View>

          <View
            style={
              styles.arrowCircle
            }
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={
                disabled
                  ? "#D1D5DB"
                  : "#9CA3AF"
              }
            />
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  container: {
    padding: 18,
    paddingBottom: 100,
  },

  headerCard: {
    backgroundColor:
      "#DC2626",
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
  },

  heading: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 10,
  },

  subtitle: {
    fontSize: 14,
    color: "#FEE2E2",
    marginTop: 6,
    lineHeight: 21,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 14,
  },

  cardWrapper: {
    marginBottom: 16,
  },

  disabledCard: {
    opacity: 0.6,
  },

  card: {
    borderRadius: 24,
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent:
      "center",
    marginRight: 16,
  },

  textBlock: {
    flex: 1,
    paddingRight: 10,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.text,
  },

  cardSubtitle: {
    fontSize: 13,
    color:
      COLORS.textMuted,
    marginTop: 5,
    lineHeight: 20,
    fontWeight: "600",
  },

  arrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor:
      "#F9FAFB",
    alignItems: "center",
    justifyContent:
      "center",
  },
});