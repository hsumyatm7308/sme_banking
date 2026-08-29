import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View, ActivityIndicator } from "react-native";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import TransactionsScreen from "./src/screens/TransactionsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import BankScreen from "./src/screens/BankScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#1E3A5F",
        tabBarInactiveTintColor: "#999",
        headerStyle: { backgroundColor: "#1E3A5F" },
        headerTintColor: "#fff",
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>👤</Text>,
        }}
      />
      {user?.role === "bank_admin" && (
        <Tab.Screen
          name="Bank"
          component={BankScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ color }}>🏦</Text>,
          }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem("token");
    setIsLoggedIn(!!token);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
