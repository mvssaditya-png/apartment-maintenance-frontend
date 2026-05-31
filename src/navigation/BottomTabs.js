import React, { useContext } from "react";

import {
  View,
  Text,
  StyleSheet,
  Platform,
} from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import PaymentsScreen from "../screens/PaymentsScreen";
import ExpensesScreen from "../screens/ExpensesScreen";
import ProfileScreen from "../screens/ProfileScreen";

import { t } from "../i18n";
import { LanguageContext } from "../context/LanguageContext";

const Tab = createBottomTabNavigator();

const COLORS = {
  primary: "#2563EB",
  white: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
};

export default function BottomTabs() {
  const { language } = useContext(LanguageContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,

        tabBarIcon: ({ focused }) => {
          const iconName = getIconName(route.name, focused);
          const label = getTabLabel(route.name);

          return (
            <View
              style={[
                styles.tabContent,
                focused && styles.activeTabContent,
              ]}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={focused ? COLORS.primary : COLORS.muted}
              />

              <Text
                style={[
                  styles.tabLabel,
                  focused && styles.activeTabLabel,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {label}
              </Text>
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Expenses" component={ExpensesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function getTabLabel(routeName) {
  switch (routeName) {
    case "Home":
      return t("tabs.home");

    case "Payments":
      return t("tabs.payments");

    case "Expenses":
      return t("tabs.expenses");

    case "Profile":
      return t("tabs.profile");

    default:
      return routeName;
  }
}

function getIconName(routeName, focused) {
  switch (routeName) {
    case "Home":
      return focused ? "home" : "home-outline";

    case "Payments":
      return focused ? "card" : "card-outline";

    case "Expenses":
      return focused ? "wallet" : "wallet-outline";

    case "Profile":
      return focused ? "person" : "person-outline";

    default:
      return "ellipse-outline";
  }
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: Platform.OS === "ios" ? 10 : 8,
    height: 78,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 6,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 12 : 8,
  },

  tabItem: {
    justifyContent: "center",
    alignItems: "center",
  },

  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },

  activeTabContent: {
    backgroundColor: "#EEF4FF",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
    color: COLORS.muted,
  },

  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: "900",
  },
});