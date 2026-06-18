import React, { useCallback, useContext, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { getLoggedInUser, getMySite } from "../api/dashboardApi";
import { AuthContext } from "../context/AuthContext";

import AppCard from "../components/common/AppCard";
import { COLORS } from "../components/common/theme";
import { LanguageContext } from "../context/LanguageContext";
import {
  t
} from "../i18n";

export default function ProfileScreen({ navigation }) {
  const { logout, subscriptionStatus } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const { language, changeLanguage } = useContext(LanguageContext);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      setLoading(true);

      const [userRes, siteRes] = await Promise.all([
        getLoggedInUser(),
        getMySite(),
      ]);

      setUser(userRes.data);
      setSite(siteRes.data);
    } catch (error) {
      console.log("PROFILE ERROR:", error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (lang) => {
    try {
      await changeLanguage(lang);
    } catch (error) {
      console.log("LANGUAGE CHANGE ERROR:", error);
    }
  };
  const handleLogout = () => {
    Alert.alert(t("profile.logout"), t("profile.logoutConfirm"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("profile.logout"),
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initials = getInitials(user?.name);

  const residentType =
    user?.residentType ||
    user?.resident_type ||
    null;

  const flatNumber =
    user?.flatNumber ||
    user?.flat_number ||
    "-";

  const phoneNumber =
    user?.phoneNumber ||
    user?.phone_number ||
    "-";

  const siteName =
    site?.siteName ||
    site?.site_name ||
    user?.siteName ||
    "-";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={styles.name}>{user?.name || "User"}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.rolePill}>
              <Text style={styles.roleText}>{user?.role || "-"}</Text>
            </View>

            {residentType ? (
              <View style={styles.typePill}>
                <Text style={styles.typeText}>{residentType}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.flatPill}>
            <Ionicons name="home-outline" size={15} color="#DBEAFE" />
            <Text style={styles.flatText}>Flat {flatNumber}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t("profile.userDetails")}</Text>

        <AppCard style={styles.card}>
          <InfoRow
            icon="call-outline"
            label={t("profile.phoneNumber")}
            value={phoneNumber}
          />

          <InfoRow
            icon="mail-outline"
            label={t("profile.email")}
            value={user?.email || "-"}
          />

          <InfoRow
            icon="person-outline"
            label={t("profile.role")}
            value={user?.role || "-"}
          />

          {residentType ? (
            <InfoRow
              icon="people-outline"
              label={t("profile.residentType")}
              value={residentType}
            />
          ) : null}

          <InfoRow
            icon="home-outline"
            label={t("profile.flatNumber")}
            value={flatNumber}
            hideBorder={!isTenant(user)}
          />

          {isTenant(user) ? (
            <>
              <InfoRow
                icon="person-circle-outline"
                label={t("profile.ownerName")}
                value={user?.ownerName || "-"}
              />

              <InfoRow
                icon="call-outline"
                label={t("profile.ownerPhone")}
                value={user?.ownerPhoneNumber || "-"}
                hideBorder
              />
            </>
          ) : null}
        </AppCard>

        <Text style={styles.sectionTitle}>{t("profile.societyDetails")}</Text>

        <AppCard style={styles.card}>
          <InfoRow
            icon="business-outline"
            label={t("profile.societyName")}
            value={siteName}
          />

          <InfoRow
            icon="location-outline"
            label={t("profile.address")}
            value={site?.address || "-"}
          />

          <InfoRow
            icon="albums-outline"
            label={t("profile.totalFlats")}
            value={String(site?.totalFlats ?? "-")}
            hideBorder
          />
        </AppCard>

        <Text style={styles.sectionTitle}>{t("subscription.title")}</Text>

        <AppCard style={styles.card}>
          <InfoRow
            icon="card-outline"
            label={t("subscription.status")}
            value={subscriptionStatus?.status || "-"}
          />

          <InfoRow
            icon="time-outline"
            label={t("subscription.daysRemaining")}
            value={String(subscriptionStatus?.daysRemaining ?? "-")}
          />

          <InfoRow
            icon="calendar-outline"
            label={t("subscription.trialEnd")}
            value={subscriptionStatus?.trialEndDate || "-"}
          />

          <InfoRow
            icon="calendar-clear-outline"
            label={t("subscription.subscriptionEnd")}
            value={subscriptionStatus?.subscriptionEndDate || "-"}
            hideBorder
          />

          {user?.role === "ADMIN" && (
            <TouchableOpacity
              style={styles.subscriptionButton}
              onPress={() => navigation.navigate("Subscription")}
              activeOpacity={0.85}
            >
              <Ionicons name="card-outline" size={20} color="#FFFFFF" />
              <Text style={styles.subscriptionButtonText}>
                {t("subscription.viewRenew")}
              </Text>
            </TouchableOpacity>
          )}
        </AppCard>

        <Text style={styles.sectionTitle}>Language</Text>

        <AppCard style={styles.card}>
          <View style={styles.languageRow}>
            <LanguageButton
              title="English"
              active={language === "en"}
              onPress={() => handleLanguageChange("en")}
            />

            <LanguageButton
              title="తెలుగు"
              active={language === "te"}
              onPress={() => handleLanguageChange("te")}
            />

            <LanguageButton
              title="हिन्दी"
              active={language === "hi"}
              onPress={() => handleLanguageChange("hi")}
            />
          </View>
        </AppCard>

        <Text style={styles.sectionTitle}>{t("profile.app")}</Text>

        <AppCard style={styles.card}>
          <InfoRow
            icon="information-circle-outline"
            label={t("profile.appVersion")}
            value="1.0.0"
          />

          <InfoRow
            icon="shield-checkmark-outline"
            label={t("profile.privacy")}
            value="Coming soon"
          />

          <InfoRow
            icon="help-circle-outline"
            label={t("profile.support")}
            value="Coming soon"
            hideBorder
          />
        </AppCard>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
          <Text style={styles.logoutText}>{t("profile.logout")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function LanguageButton({ title, active, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.languageButton,
        active && styles.languageButtonActive,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text
        style={[
          styles.languageText,
          active && styles.languageTextActive,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function InfoRow({ icon, label, value, hideBorder = false }) {
  return (
    <View style={[styles.infoRow, hideBorder && styles.noBorder]}>
      <View style={styles.infoIconBox}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>

      <View style={styles.infoTextBlock}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function isTenant(user) {
  const residentType =
    user?.residentType ||
    user?.resident_type ||
    "";

  return residentType.toUpperCase() === "TENANT";
}

function getInitials(name) {
  if (!name) {
    return "U";
  }

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 120,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loaderText: {
    marginTop: 10,
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  headerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  avatarText: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.primary,
  },

  name: {
    fontSize: 25,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },

  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  rolePill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    marginHorizontal: 4,
    marginBottom: 8,
  },

  roleText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
  },

  typePill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    marginHorizontal: 4,
    marginBottom: 8,
  },

  typeText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
  },

  flatPill: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  flatText: {
    color: "#DBEAFE",
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "800",
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 12,
  },

  card: {
    marginBottom: 22,
    borderRadius: 22,
    paddingVertical: 4,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  noBorder: {
    borderBottomWidth: 0,
  },

  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoTextBlock: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "700",
  },

  infoValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "900",
    marginTop: 3,
  },

  languageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  languageButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },

  languageButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  languageText: {
    color: "#374151",
    fontWeight: "900",
    fontSize: 13,
  },

  languageTextActive: {
    color: "#FFFFFF",
  },

  logoutButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 6,
  },

  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 8,
  },

  subscriptionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 12,
  },

  subscriptionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },
});