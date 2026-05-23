import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import OtpScreen from "../screens/OtpScreen";
import SplashScreen from "../screens/SplashScreen";
import BottomTabs from "./BottomTabs";
import OpeningBalanceScreen from "../screens/OpeningBalanceScreen";
import PaymentRequestScreen from "../screens/PaymentRequestScreen";
import { AuthContext } from "../context/AuthContext";
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
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken ? (
          <>
            <Stack.Screen
              name="Dashboard"
              component={BottomTabs}
            />

            <Stack.Screen
              name="OpeningBalance"
              component={OpeningBalanceScreen}
              options={{
                headerShown: true,
                title: "Opening Balance",
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="PaymentRequest"
              component={PaymentRequestScreen}
              options={{
                headerShown: true,
                title: "Payment Request",
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="MyDues"
              component={MyDuesScreen}
              options={{
                headerShown: true,
                title: "My Dues",
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="SubmitPayment"
              component={SubmitPaymentScreen}
              options={{
                headerShown: true,
                title: "Submit Payment",
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="SubmittedPayments"
              component={SubmittedPaymentsScreen}
              options={{
                headerShown: true,
                title: "Submitted Payments",
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="AddExpense"
              component={AddExpenseScreen}
              options={{
                headerShown: true,
                title: "Add Expense",
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="ViewExpenses"
              component={ViewExpensesScreen}
              options={{
                headerShown: true,
                title: "View Expenses",
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="ImagePreview"
              component={ImagePreviewScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Defaulters"
              component={DefaultersScreen}
              options={{
                headerShown: true,
                title: "Defaulters",
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="RecordPayment"
              component={RecordPaymentScreen}
              options={{
                headerShown: true,
                title: "Record Payment",
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="PaymentHistory"
              component={PaymentHistoryScreen}
              options={{
                headerShown: true,
                title: "Payment History",
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="AdminUsers"
              component={AdminUsersScreen}
              options={{
                headerShown: true,
                title: "Manage Users",
                headerBackTitleVisible: false,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />

            <Stack.Screen
              name="Otp"
              component={OtpScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}