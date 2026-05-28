import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AppCard from "../common/AppCard";
import { COLORS } from "../common/theme";

import { t } from "../../i18n";
import { LanguageContext } from "../../context/LanguageContext";

export default function OverviewStats({ summary, dashboard }) {
  // IMPORTANT:
  // This makes component re-render on language change
  const { language } = useContext(LanguageContext);

  // Prevent unused variable warning
  const currentLanguage = language;

  const totalCollection =
    summary?.totalCollection ??
    summary?.collection ??
    summary?.totalPaid ??
    dashboard?.totalCollected ??
    0;

  const totalExpenses =
    summary?.totalExpenses ??
    summary?.expenses ??
    summary?.totalExpense ??
    dashboard?.totalExpenses ??
    0;

  const openingBalance =
    summary?.openingBalance ??
    dashboard?.openingBalance ??
    0;

  const closingBalance =
    summary?.closingBalance ??
    dashboard?.currentBalance ??
    0;

  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {t("home.overview")}
        </Text>

        <Text style={styles.monthText}>
          {t("home.thisMonth")}
        </Text>
      </View>

      <View style={styles.grid}>
        <StatCard
          title={t("home.paidThisMonth")}
          amount={`₹${formatAmount(totalCollection)}`}
          icon="trending-up-outline"
          iconColor={COLORS.success}
          bg="#ECFDF5"
        />

        <StatCard
          title={t("home.expenses")}
          amount={`₹${formatAmount(totalExpenses)}`}
          icon="trending-down-outline"
          iconColor={COLORS.danger}
          bg="#FEF2F2"
        />

        <StatCard
          title={t("home.openingBalance")}
          amount={`₹${formatAmount(openingBalance)}`}
          icon="card-outline"
          iconColor={COLORS.primary}
          bg="#EEF5FF"
        />

        <StatCard
          title={t("home.closingBalance")}
          amount={`₹${formatAmount(closingBalance)}`}
          icon="pie-chart-outline"
          iconColor={COLORS.purple}
          bg="#F3E8FF"
        />
      </View>
    </>
  );
}

function StatCard({
  title,
  amount,
  icon,
  iconColor,
  bg,
}) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.title}>
          {title}
        </Text>

        <View
          style={[
            styles.iconBox,
            { backgroundColor: bg },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={iconColor}
          />
        </View>
      </View>

      <Text style={styles.amount}>
        {amount}
      </Text>
    </AppCard>
  );
}

function formatAmount(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "0";
  }

  return Number(value).toLocaleString(
    "en-IN"
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 14,
  },

  monthText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 14,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  card: {
    width: "48%",
    padding: 15,
    marginBottom: 12,
  },

  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "700",
    flex: 1,
    paddingRight: 6,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  amount: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 14,
  },
});