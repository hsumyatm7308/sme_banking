import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../lib/colors";

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          navigation.replace("Login");
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadingLogo}>
          <Text style={styles.loadingIcon}>👤</Text>
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.owner_name?.charAt(0) || "?"}
          </Text>
        </View>
        <Text style={styles.name}>{user.owner_name}</Text>
        <Text style={styles.business}>{user.business_name}</Text>
      </View>

      {/* Business Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Information</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Business Name</Text>
          <Text style={styles.infoValue}>{user.business_name}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Owner Name</Text>
          <Text style={styles.infoValue}>{user.owner_name}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{user.phone}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Sector</Text>
          <Text style={styles.infoValue}>{user.sector}</Text>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Change Password</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Language</Text>
          <View style={styles.languageBadge}>
            <Text style={styles.languageText}>Myanmar ▼</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingIcon: {
    fontSize: 40,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  header: {
    alignItems: "center",
    padding: 30,
    paddingTop: 40,
    backgroundColor: colors.primary,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: colors.textWhite,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textWhite,
    marginTop: 16,
  },
  business: {
    fontSize: 16,
    color: colors.textWhite,
    marginTop: 6,
    opacity: 0.9,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: 16,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 14,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  languageBadge: {
    backgroundColor: `${colors.accent}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  languageText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "500",
  },
  arrow: {
    color: colors.textLight,
    fontSize: 20,
  },
  logoutButton: {
    margin: 16,
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.error,
  },
  logoutText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: "700",
  },
});
