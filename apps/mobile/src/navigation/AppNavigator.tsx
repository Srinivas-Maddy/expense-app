import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ExpensesScreen from "../screens/ExpensesScreen";
import IncomeScreen from "../screens/IncomeScreen";
import MoreScreen from "../screens/MoreScreen";
import BudgetsScreen from "../screens/BudgetsScreen";
import TrendsScreen from "../screens/TrendsScreen";
import RecurringScreen from "../screens/RecurringScreen";
import AccountsScreen from "../screens/AccountsScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import ExportScreen from "../screens/ExportScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();

/**
 * Stack navigator nested inside the "More" tab.
 * The root is the MoreScreen hub; each menu item pushes its own screen.
 */
function MoreStackNavigator() {
  return (
    <MoreStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#fff" },
        headerTintColor: "#4f46e5",
        headerTitleStyle: { fontWeight: "700", color: "#1a1a2e" },
        headerBackTitleVisible: false,
      }}>
      <MoreStack.Screen
        name="MoreHub"
        component={MoreScreen}
        options={{ headerShown: false }}
      />
      <MoreStack.Screen
        name="Budgets"
        component={BudgetsScreen}
        options={{ title: "Budgets" }}
      />
      <MoreStack.Screen
        name="Trends"
        component={TrendsScreen}
        options={{ title: "Trends" }}
      />
      <MoreStack.Screen
        name="Recurring"
        component={RecurringScreen}
        options={{ title: "Recurring Expenses" }}
      />
      <MoreStack.Screen
        name="Accounts"
        component={AccountsScreen}
        options={{ title: "Accounts" }}
      />
      <MoreStack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: "Categories" }}
      />
      <MoreStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notifications" }}
      />
      <MoreStack.Screen
        name="Export"
        component={ExportScreen}
        options={{ title: "Export Data" }}
      />
    </MoreStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#f0f0f5",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: "Dashboard" }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{ tabBarLabel: "Expenses" }}
      />
      <Tab.Screen
        name="Income"
        component={IncomeScreen}
        options={{ tabBarLabel: "Income" }}
      />
      <Tab.Screen
        name="More"
        component={MoreStackNavigator}
        options={{ tabBarLabel: "More" }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
