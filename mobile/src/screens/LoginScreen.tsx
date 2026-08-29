import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../lib/api";
import { colors } from "../lib/colors";

export default function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("username", phone);
      formData.append("password", password);

      const response = await api.post("/api/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      await AsyncStorage.setItem("token", response.data.access_token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      navigation.replace("Main");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🏦</Text>
        </View>
        <Text style={styles.title}>SME Banking</Text>
        <Text style={styles.subtitle}>AI-Powered Business Growth</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="09-xxxxxxxxx"
          placeholderTextColor={colors.textLight}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.textLight}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing in..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>
            Don&apos;t have an account? <Text style={styles.linkBold}>Register</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.demo}>
          <Text style={styles.demoTitle}>Demo Accounts:</Text>
          <Text style={styles.demoText}>SME: 09123456789 / password123</Text>
          <Text style={styles.demoText}>Admin: 09987654321 / admin123</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    fontSize: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  form: {
    paddingHorizontal: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: colors.textWhite,
    fontSize: 18,
    fontWeight: "700",
  },
  link: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 24,
    fontSize: 14,
  },
  linkBold: {
    color: colors.primary,
    fontWeight: "600",
  },
  demo: {
    marginTop: 30,
    padding: 16,
    backgroundColor: `${colors.accent}15`,
    borderRadius: 12,
  },
  demoTitle: {
    fontWeight: "600",
    marginBottom: 8,
    color: colors.accent,
  },
  demoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});
