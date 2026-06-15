import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import OtpScreen from "../screens/OtpScreen";
import SplashScreen from "../screens/SplashScreen";
import BottomTabs from "./BottomTabs";

import OpeningBalanceScreen from "../screens/OpeningBalanceScreen";
import PaymentRequestScreen from "../screens/PaymentRequestScreen";
import MyDuesScreen from "../screens/MyDuesScreen";
import SubmitPaymentScreen from "../screens/SubmitPaymentScreen";
import SubmittedPaymentsScreen from "../screens/SubmittedPaymentsScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import ViewExpensesScreen from "../screens/ViewExpensesScreen";
import ImagePreviewScreen from "../screens/ImagePreviewScreen";
import DefaultersScreen from "../screens/DefaultersScreen";
import RecordPaymentScreen from "../screens/RecordPaymentScreen";
import PaymentHistoryScreen from "../screens/PaymentHistoryScreen";
import AdminUsersScreen from "../screens/AdminUsersScreen";
import ScheduledPaymentRequestsScreen from "../screens/ScheduledPaymentRequestsScreen";
import NoticesScreen from "../screens/NoticesScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import SOSScreen from "../screens/SOSScreen";
import MeetingsScreen from "../screens/MeetingsScreen";
import ComplaintsScreen from "../screens/ComplaintsScreen";
import ManageSitesScreen from "../screens/ManageSitesScreen";
import SuperAdminDashboardScreen from "../screens/SuperAdminDashboardScreen";
import CreateSiteScreen from "../screens/CreateSiteScreen";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import { t } from "../i18n";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userToken, userRole, isLoading } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);

  if (isLoading) {
    return <SplashScreen />;
  }

  const headerOptions = (title) => ({
    headerShown: true,
    title,
    headerBackTitle: t("common.back"),
    headerBackTitleVisible: false,
    headerTitleAlign: "center",
  });

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          userRole === "SUPER_ADMIN" ? (
            <>
              <Stack.Screen
                name="SuperAdminDashboard"
                component={SuperAdminDashboardScreen}
              />
              <Stack.Screen
                name="ManageSites"
                component={ManageSitesScreen}
                options={headerOptions("Manage Apartments")}
              />
              <Stack.Screen
                name="CreateSite"
                component={CreateSiteScreen}
                options={headerOptions("Create Apartment")}
              />
            </>
          ) : (
            <>
              <Stack.Screen name="Dashboard" component={BottomTabs} />

              <Stack.Screen
                name="OpeningBalance"
                component={OpeningBalanceScreen}
                options={headerOptions(t("navigation.openingBalance"))}
              />

              <Stack.Screen
                name="PaymentRequest"
                component={PaymentRequestScreen}
                options={headerOptions(t("navigation.paymentRequest"))}
              />

              <Stack.Screen
                name="MyDues"
                component={MyDuesScreen}
                options={headerOptions(t("navigation.myDues"))}
              />

              <Stack.Screen
                name="SubmitPayment"
                component={SubmitPaymentScreen}
                options={headerOptions(t("navigation.submitPayment"))}
              />

              <Stack.Screen
                name="SubmittedPayments"
                component={SubmittedPaymentsScreen}
                options={headerOptions(t("navigation.submittedPayments"))}
              />

              <Stack.Screen
                name="AddExpense"
                component={AddExpenseScreen}
                options={headerOptions(t("navigation.addExpense"))}
              />

              <Stack.Screen
                name="ViewExpenses"
                component={ViewExpensesScreen}
                options={headerOptions(t("navigation.viewExpenses"))}
              />

              <Stack.Screen
                name="ImagePreview"
                component={ImagePreviewScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="Defaulters"
                component={DefaultersScreen}
                options={headerOptions(t("navigation.defaulters"))}
              />

              <Stack.Screen
                name="RecordPayment"
                component={RecordPaymentScreen}
                options={headerOptions(t("navigation.recordPayment"))}
              />

              <Stack.Screen
                name="PaymentHistory"
                component={PaymentHistoryScreen}
                options={headerOptions(t("navigation.paymentHistory"))}
              />

              <Stack.Screen
                name="AdminUsers"
                component={AdminUsersScreen}
                options={headerOptions(t("navigation.manageUsers"))}
              />

              <Stack.Screen
                name="ScheduledPaymentRequests"
                component={ScheduledPaymentRequestsScreen}
                options={headerOptions(t("navigation.scheduledPayments"))}
              />

              <Stack.Screen
                name="Notices"
                component={NoticesScreen}
                options={headerOptions(t("navigation.notices"))}
              />

              <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={headerOptions(t("navigation.notifications"))}
              />

              <Stack.Screen
                name="SOS"
                component={SOSScreen}
                options={headerOptions(t("navigation.sosEmergency"))}
              />

              <Stack.Screen
                name="Meetings"
                component={MeetingsScreen}
                options={headerOptions(t("navigation.meetings"))}
              />

              <Stack.Screen
                name="Complaints"
                component={ComplaintsScreen}
                options={headerOptions(t("navigation.complaints"))}
              />
            </>
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Otp" component={OtpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}