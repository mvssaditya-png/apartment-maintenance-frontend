import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import AsyncStorage from "@react-native-async-storage/async-storage";

import FlatSelector from "../components/common/FlatSelector";

import AppCard from "../components/common/AppCard";
import AppButton from "../components/common/AppButton";
import EmptyState from "../components/common/EmptyState";

import { COLORS } from "../components/common/theme";

import {
  getLoggedInUser,
  getFlatOptions,
  getFlatStatement,
  getFlatStatementExportUrl,
  getAllFlatStatementsExportUrl,
  getFullFileUrl,
} from "../api/dashboardApi";

export default function PaymentHistoryScreen() {
  const [user, setUser] = useState(null);

  const [flats, setFlats] = useState([]);

  const [selectedFlat, setSelectedFlat] =
    useState(null);

  const [statement, setStatement] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [statementLoading, setStatementLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [])
  );

  const downloadAndShareExcel =
    async (url, fileName) => {
      try {
        const token =
          await AsyncStorage.getItem(
            "token"
          );

        const fileUri =
          FileSystem.documentDirectory +
          fileName;

        const result =
          await FileSystem.downloadAsync(
            url,
            fileUri,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (result.status !== 200) {
          Alert.alert(
            "Error",
            "Unable to export Excel."
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
                "Share Statement",

              UTI:
                "com.microsoft.excel.xlsx",
            }
          );
        } else {
          Alert.alert(
            "Downloaded",
            "Excel exported successfully."
          );
        }
      } catch (error) {
        console.log(
          "EXPORT STATEMENT ERROR:",
          error
        );

        Alert.alert(
          "Error",
          "Unable to export Excel."
        );
      }
    };

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const userRes =
        await getLoggedInUser();

      const loggedUser =
        userRes.data;

      setUser(loggedUser);

      const role =
        loggedUser?.role?.toUpperCase();

      if (
        role === "ADMIN" ||
        role === "CASHIER"
      ) {
        const flatsRes =
          await getFlatOptions();

        setFlats(flatsRes.data || []);

        if (
          flatsRes.data?.length > 0
        ) {
          const firstFlat =
            flatsRes.data[0];

          setSelectedFlat(
            firstFlat
          );

          await loadStatement(
            firstFlat.flatId
          );
        }
      } else {
        await loadStatement(
          loggedUser.flatId ||
            loggedUser.flat_id
        );
      }
    } catch (error) {
      console.log(
        "PAYMENT HISTORY ERROR:",
        error?.response?.data ||
          error
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStatement = async (
    flatId
  ) => {
    try {
      setStatementLoading(true);

      const res =
        await getFlatStatement(
          flatId
        );

      setStatement(
        res.data || []
      );
    } catch (error) {
      console.log(
        "FLAT STATEMENT ERROR:",
        error?.response?.data ||
          error
      );

      setStatement([]);
    } finally {
      setStatementLoading(false);
    }
  };

  const onSelectFlat = async (
    flat
  ) => {
    setSelectedFlat(flat);

    await loadStatement(
      flat.flatId
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);

    if (selectedFlat) {
      await loadStatement(
        selectedFlat.flatId
      );
    } else if (
      user?.flatId ||
      user?.flat_id
    ) {
      await loadStatement(
        user.flatId ||
          user.flat_id
      );
    } else {
      await loadInitialData();
    }

    setRefreshing(false);
  };

  const handleExportSelectedFlat =
    async () => {
      const flatId =
        selectedFlat?.flatId ||
        user?.flatId ||
        user?.flat_id;

      if (!flatId) {
        Alert.alert(
          "Error",
          "Flat not selected."
        );

        return;
      }

      await downloadAndShareExcel(
        getFlatStatementExportUrl(
          flatId
        ),
        "flat-statement.xlsx"
      );
    };

  const handleExportAllFlats =
    async () => {
      await downloadAndShareExcel(
        getAllFlatStatementsExportUrl(),
        "all-flats-payment-history.xlsx"
      );
    };

  const isAdminOrCashier =
    user?.role?.toUpperCase() ===
      "ADMIN" ||
    user?.role?.toUpperCase() ===
      "CASHIER";

  const totalDebit =
    statement.reduce(
      (sum, item) =>
        sum +
        Number(item.debit || 0),
      0
    );

  const totalCredit =
    statement.reduce(
      (sum, item) =>
        sum +
        Number(item.credit || 0),
      0
    );

  const currentBalance =
    statement.length > 0
      ? Number(
          statement[
            statement.length - 1
          ]?.balanceAfter || 0
        )
      : 0;

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <View
          style={styles.loaderContainer}
        >
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />

          <Text style={styles.loaderText}>
            Loading payment
            history...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["bottom"]}
    >
      <ScrollView
        contentContainerStyle={
          styles.container
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={
              COLORS.primary
            }
          />
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text style={styles.heading}>
          Payment History
        </Text>

        <Text style={styles.subtitle}>
          View flat-wise dues,
          payments and running
          balance.
        </Text>

        {isAdminOrCashier && (
          <FlatSelector
            flats={flats}
            selectedFlat={
              selectedFlat
            }
            onSelectFlat={
              onSelectFlat
            }
          />
        )}

        <AppCard
          style={styles.summaryCard}
        >
          <View
            style={
              styles.summaryTopRow
            }
          >
            <View
              style={
                styles.summaryTextBlock
              }
            >
              <Text
                style={
                  styles.summaryLabel
                }
              >
                {isAdminOrCashier
                  ? `Flat ${
                      selectedFlat?.flatNumber ||
                      "-"
                    }`
                  : `Flat ${
                      user?.flatNumber ||
                      user?.flat_number ||
                      "-"
                    }`}
              </Text>

              <Text
                style={
                  styles.summaryAmount
                }
              >
                ₹
                {formatAmount(
                  Math.abs(
                    currentBalance
                  )
                )}
              </Text>

              <Text
                style={
                  styles.summarySubText
                }
              >
                {Number(
                  currentBalance ||
                    0
                ) < 0
                  ? "Pending balance"
                  : "Available balance"}
              </Text>
            </View>

            <View
              style={
                styles.summaryIconBox
              }
            >
              <Ionicons
                name="wallet-outline"
                size={30}
                color="#FFFFFF"
              />
            </View>
          </View>
        </AppCard>

        <View style={styles.exportRow}>
          <AppButton
            title="Export Selected Flat"
            onPress={
              handleExportSelectedFlat
            }
            style={
              styles.exportButton
            }
          />

          {isAdminOrCashier && (
            <AppButton
              title="Export All Flats"
              variant="success"
              onPress={
                handleExportAllFlats
              }
              style={
                styles.exportButton
              }
            />
          )}
        </View>

        <View style={styles.statsRow}>
          <AppCard
            style={styles.statCard}
          >
            <View
              style={
                styles.statTopRow
              }
            >
              <View
                style={[
                  styles.statIconBox,
                  {
                    backgroundColor:
                      "#FEF2F2",
                  },
                ]}
              >
                <Ionicons
                  name="arrow-up-outline"
                  size={20}
                  color="#DC2626"
                />
              </View>
            </View>

            <Text
              style={
                styles.statLabel
              }
            >
              Total Charges
            </Text>

            <Text
              style={
                styles.statDebit
              }
            >
              ₹
              {formatAmount(
                totalDebit
              )}
            </Text>
          </AppCard>

          <AppCard
            style={styles.statCard}
          >
            <View
              style={
                styles.statTopRow
              }
            >
              <View
                style={[
                  styles.statIconBox,
                  {
                    backgroundColor:
                      "#ECFDF5",
                  },
                ]}
              >
                <Ionicons
                  name="arrow-down-outline"
                  size={20}
                  color="#16A34A"
                />
              </View>
            </View>

            <Text
              style={
                styles.statLabel
              }
            >
              Total Paid
            </Text>

            <Text
              style={
                styles.statCredit
              }
            >
              ₹
              {formatAmount(
                totalCredit
              )}
            </Text>
          </AppCard>
        </View>

        <Text
          style={styles.sectionTitle}
        >
          Statement
        </Text>

        {statementLoading ? (
          <AppCard>
            <View
              style={
                styles.statementLoader
              }
            >
              <ActivityIndicator
                color={
                  COLORS.primary
                }
              />

              <Text
                style={
                  styles.loaderText
                }
              >
                Loading
                statement...
              </Text>
            </View>
          </AppCard>
        ) : statement.length ===
          0 ? (
          <AppCard>
            <EmptyState
              icon="document-text-outline"
              title="No history found"
              subtitle="No payment statement entries are available."
            />
          </AppCard>
        ) : (
          statement.map(
            (item, index) => (
              <StatementCard
                key={`${item.date}-${index}`}
                item={item}
              />
            )
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatementCard({
  item,
}) {
  const isCredit =
    Number(item.credit || 0) >
    0;

  const amount = isCredit
    ? item.credit
    : item.debit;

  const balanceAfter =
    Number(
      item.balanceAfter || 0
    );

  const handleViewReceipt =
    () => {
      const receiptUrl =
        getFullFileUrl(
          item.receiptPdfUrl
        );

      if (receiptUrl) {
        Linking.openURL(
          receiptUrl
        );
      }
    };

  return (
    <AppCard
      style={styles.statementCard}
    >
      <View
        style={styles.statementTop}
      >
        <View
          style={[
            styles.statementIconBox,
            {
              backgroundColor:
                isCredit
                  ? "#ECFDF5"
                  : "#FEF2F2",
            },
          ]}
        >
          <Ionicons
            name={
              isCredit
                ? "arrow-down-circle-outline"
                : "arrow-up-circle-outline"
            }
            size={24}
            color={
              isCredit
                ? "#16A34A"
                : "#DC2626"
            }
          />
        </View>

        <View
          style={
            styles.statementTextBlock
          }
        >
          <Text
            style={
              styles.statementTitle
            }
          >
            {item.description}
          </Text>

          <Text
            style={
              styles.statementDate
            }
          >
            {formatDate(
              item.date
            )}
          </Text>
        </View>

        <Text
          style={[
            styles.statementAmount,
            {
              color: isCredit
                ? "#16A34A"
                : "#DC2626",
            },
          ]}
        >
          {isCredit
            ? "+"
            : "-"}
          ₹
          {formatAmount(amount)}
        </Text>
      </View>

      <View
        style={styles.balanceRow}
      >
        <Text
          style={
            styles.balanceLabel
          }
        >
          {balanceAfter < 0
            ? "Pending After"
            : "Balance After"}
        </Text>

        <Text
          style={[
            styles.balanceValue,
            {
              color:
                balanceAfter < 0
                  ? "#DC2626"
                  : "#16A34A",
            },
          ]}
        >
          ₹
          {formatAmount(
            Math.abs(
              balanceAfter
            )
          )}
        </Text>
      </View>

      {isCredit &&
      item.receiptPdfUrl ? (
        <TouchableOpacity
          style={
            styles.receiptButton
          }
          onPress={
            handleViewReceipt
          }
          activeOpacity={0.85}
        >
          <View
            style={
              styles.receiptIconCircle
            }
          >
            <Ionicons
              name="document-text-outline"
              size={24}
              color={
                COLORS.primary
              }
            />
          </View>

          <Text
            style={
              styles.receiptButtonText
            }
          >
            View Receipt PDF
          </Text>
        </TouchableOpacity>
      ) : null}
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

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return String(value).substring(
      0,
      10
    );
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
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

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loaderText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  heading: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.text,
  },

  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginTop: 6,
    marginBottom: 22,
    lineHeight: 22,
    fontWeight: "600",
  },

  summaryCard: {
    backgroundColor:
      COLORS.primary,
    borderWidth: 0,
    borderRadius: 26,
    marginBottom: 18,
  },

  summaryTopRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  summaryTextBlock: {
    flex: 1,
    paddingRight: 12,
  },

  summaryLabel: {
    color: "#DBEAFE",
    fontSize: 14,
    fontWeight: "700",
  },

  summaryAmount: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    marginTop: 6,
  },

  summarySubText: {
    color: "#E0E7FF",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "600",
  },

  summaryIconBox: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor:
      "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  exportRow: {
    marginBottom: 20,
  },

  exportButton: {
    marginBottom: 10,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginBottom: 24,
  },

  statCard: {
    width: "48%",
  },

  statTopRow: {
    marginBottom: 10,
  },

  statIconBox: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  statLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "700",
  },

  statDebit: {
    fontSize: 22,
    fontWeight: "900",
    color: "#DC2626",
    marginTop: 8,
  },

  statCredit: {
    fontSize: 22,
    fontWeight: "900",
    color: "#16A34A",
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 12,
  },

  statementLoader: {
    alignItems: "center",
    paddingVertical: 10,
  },

  statementCard: {
    marginBottom: 14,
    borderRadius: 22,
  },

  statementTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  statementIconBox: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  statementTextBlock: {
    flex: 1,
    paddingRight: 8,
  },

  statementTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
  },

  statementDate: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: "600",
  },

  statementAmount: {
    fontSize: 17,
    fontWeight: "900",
  },

  balanceRow: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.borderLight,
    flexDirection: "row",
    justifyContent:
      "space-between",
  },

  balanceLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "700",
  },

  balanceValue: {
    fontSize: 14,
    fontWeight: "900",
  },

  receiptButton: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  receiptIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  receiptButtonText: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 14,
  },
});