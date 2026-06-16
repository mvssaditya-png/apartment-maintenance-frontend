import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  createSite,
  updateSite,
} from "../api/superAdminApi";

export default function CreateSiteScreen({ route, navigation }) {
  const editingSite = route.params?.site || null;
  const isEditMode = !!editingSite;

  const [siteName, setSiteName] = useState(editingSite?.siteName || "");
  const [address, setAddress] = useState(editingSite?.address || "");
  const [city, setCity] = useState(editingSite?.city || "");
  const [state, setState] = useState(editingSite?.state || "");

  const [maintenanceAmount, setMaintenanceAmount] = useState(
    editingSite?.maintenanceAmount ? String(editingSite.maintenanceAmount) : ""
  );

  const [openingBalance, setOpeningBalance] = useState(
    editingSite?.openingBalance ? String(editingSite.openingBalance) : ""
  );

  const [totalFlats, setTotalFlats] = useState(
    editingSite?.totalFlats ? String(editingSite.totalFlats) : ""
  );

  const [adminName, setAdminName] = useState(editingSite?.adminName || "");
  const [adminPhoneNumber, setAdminPhoneNumber] = useState(
    editingSite?.adminPhone || editingSite?.adminPhoneNumber || ""
  );
  const [adminEmail, setAdminEmail] = useState(editingSite?.adminEmail || "");

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!siteName.trim()) {
      Alert.alert("Validation", "Please enter apartment name.");
      return;
    }

    if (!address.trim()) {
      Alert.alert("Validation", "Please enter apartment address.");
      return;
    }

    if (!city.trim()) {
      Alert.alert("Validation", "Please enter city.");
      return;
    }

    if (!state.trim()) {
      Alert.alert("Validation", "Please enter state.");
      return;
    }

    if (!maintenanceAmount || Number(maintenanceAmount) <= 0) {
      Alert.alert("Validation", "Please enter valid maintenance amount.");
      return;
    }

    if (!totalFlats || Number(totalFlats) <= 0) {
      Alert.alert("Validation", "Please enter valid total flats.");
      return;
    }

    if (!adminName.trim()) {
      Alert.alert("Validation", "Please enter admin name.");
      return;
    }

    if (!adminPhoneNumber.trim() || adminPhoneNumber.length !== 10) {
      Alert.alert("Validation", "Please enter valid 10 digit admin phone.");
      return;
    }

    const payload = {
      siteName: siteName.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      maintenanceAmount: Number(maintenanceAmount),
      openingBalance: openingBalance ? Number(openingBalance) : 0,
      totalFlats: Number(totalFlats),
      adminName: adminName.trim(),
      adminPhoneNumber: adminPhoneNumber.trim(),
      adminEmail: adminEmail.trim(),
    };

    try {
      setLoading(true);

      if (isEditMode) {
        await updateSite(editingSite.siteId, payload);

        Alert.alert("Success", "Apartment updated successfully.", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        await createSite(payload);

        Alert.alert(
          "Success",
          "Apartment created successfully with 3 months free trial.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.log("SAVE SITE ERROR:", error?.response?.data || error);

      Alert.alert(
        "Error",
        error?.response?.data?.message || "Unable to save apartment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerCard}>
            <View style={styles.iconBox}>
              <Ionicons name="business-outline" size={34} color="#FFFFFF" />
            </View>

            <Text style={styles.title}>
              {isEditMode ? "Edit Apartment" : "Create Apartment"}
            </Text>

            <Text style={styles.subtitle}>
              {isEditMode
                ? "Update apartment details and admin information."
                : "Add a new apartment site and create the first admin user. Free trial will be activated for 3 months."}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Apartment Details</Text>

            <Field
              label="Apartment Name"
              placeholder="Example: Green Valley Apartments"
              value={siteName}
              onChangeText={setSiteName}
            />

            <Field
              label="Address"
              placeholder="Apartment full address"
              value={address}
              onChangeText={setAddress}
            />

            <Field
              label="City"
              placeholder="Example: Visakhapatnam"
              value={city}
              onChangeText={setCity}
            />

            <Field
              label="State"
              placeholder="Example: Andhra Pradesh"
              value={state}
              onChangeText={setState}
            />

            <Field
              label="Monthly Maintenance Amount"
              placeholder="Example: 2000"
              keyboardType="numeric"
              value={maintenanceAmount}
              onChangeText={(text) =>
                setMaintenanceAmount(text.replace(/[^0-9.]/g, ""))
              }
            />

            <Field
              label="Opening Balance"
              placeholder="Example: 50000"
              keyboardType="numeric"
              value={openingBalance}
              onChangeText={(text) =>
                setOpeningBalance(text.replace(/[^0-9.]/g, ""))
              }
            />

            <Field
              label="Total Flats"
              placeholder="Example: 40"
              keyboardType="numeric"
              value={totalFlats}
              onChangeText={(text) =>
                setTotalFlats(text.replace(/[^0-9]/g, ""))
              }
            />

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Apartment Admin</Text>

            <Field
              label="Admin Name"
              placeholder="Enter admin name"
              value={adminName}
              onChangeText={setAdminName}
            />

            <Field
              label="Admin Phone Number"
              placeholder="10 digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              value={adminPhoneNumber}
              onChangeText={(text) =>
                setAdminPhoneNumber(text.replace(/[^0-9]/g, ""))
              }
            />

            <Field
              label="Admin Email"
              placeholder="Enter admin email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={adminEmail}
              onChangeText={setAdminEmail}
            />

            {!isEditMode && (
              <View style={styles.trialBox}>
                <Ionicons name="gift-outline" size={23} color="#2563EB" />

                <View style={{ flex: 1 }}>
                  <Text style={styles.trialTitle}>3 Months Free Trial</Text>
                  <Text style={styles.trialText}>
                    The apartment will be active immediately after creation.
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.createButtonText}>
                    {isEditMode ? "Update Apartment" : "Create Apartment"}
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
  maxLength,
  autoCapitalize,
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
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  keyboardView: {
    flex: 1,
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

  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
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

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 18,
  },

  trialBox: {
    backgroundColor: "#EEF4FF",
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  trialTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
    marginLeft: 10,
  },

  trialText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 10,
    marginTop: 3,
    lineHeight: 18,
  },

  createButton: {
    backgroundColor: "#2563EB",
    borderRadius: 18,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginRight: 8,
  },
});