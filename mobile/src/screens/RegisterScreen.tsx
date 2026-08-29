import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import api from "../lib/api";
import { colors } from "../lib/colors";

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    business_name: "",
    owner_name: "",
    sector: "Retail",
  });
  const [loading, setLoading] = useState(false);

  const sectors = ["Retail", "Food", "Services", "Manufacturing", "Technology", "Other"];

  const handleRegister = async () => {
    if (!formData.phone || !formData.password || !formData.business_name || !formData.owner_name) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/register", formData);
      Alert.alert("Success", "Account created successfully", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🏦</Text>
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join SME Banking today</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Business Name</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textLight}
          value={formData.business_name}
          onChangeText={(text) => setFormData({ ...formData, business_name: text })}
        />

        <Text style={styles.label}>Owner Name</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textLight}
          value={formData.owner_name}
          onChangeText={(text) => setFormData({ ...formData, owner_name: text })}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="09-xxxxxxxxx"
          placeholderTextColor={colors.textLight}
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textLight}
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />

        <Text style={styles.label}>Sector</Text>
        <View style={styles.sectorContainer}>
          {sectors.map((sector) => (
            <TouchableOpacity
              key={sector}
              style={[
                styles.sectorButton,
                formData.sector === sector && styles.sectorButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, sector })}
            >
              <Text
                style={[
                  styles.sectorText,
                  formData.sector === sector && styles.sectorTextActive,
                ]}
              >
                {sector}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating Account..." : "Create Account"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>
            Already have an account? <Text style={styles.linkBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
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
  sectorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  sectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sectorButtonActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  sectorText: {
    color: colors.textSecondary,
    fontWeight: "500",
  },
  sectorTextActive: {
    color: colors.textWhite,
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
    marginBottom: 40,
  },
  linkBold: {
    color: colors.primary,
    fontWeight: "600",
  },
});
