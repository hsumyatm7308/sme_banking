import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.owner_name?.charAt(0) || "?"}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>●</Text>
          </View>
        </View>
        <Text style={styles.name}>{user.owner_name}</Text>
        <Text style={styles.business}>{user.business_name}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>
              {user.sector}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: `${colors.success}15` }]}>
            <Text style={[styles.badgeText, { color: colors.success }]}>
              Active
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>K 250,000</Text>
            <Text style={styles.statLabel}>Balance</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statIcon, { fontSize: 20 }]}>📈</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>K 150K</Text>
            <Text style={styles.statLabel}>Income</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statIcon, { fontSize: 20 }]}>📉</Text>
            <Text style={[styles.statValue, { color: colors.error }]}>K 100K</Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.statIcon}>📋</Text>
            <Text style={styles.statValue}>19</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
        </View>
      </View>

      {/* Business Information */}
      <View style={[styles.section, { marginTop: 16 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Business Information</Text>
          <Text style={styles.sectionBadge}>Aug 2026</Text>
        </View>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: `${colors.primary}10` }]}>
              <Text>🏢</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Business Name</Text>
              <Text style={styles.infoValue}>{user.business_name}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: `${colors.primary}10` }]}>
              <Text>👤</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Owner Name</Text>
              <Text style={styles.infoValue}>{user.owner_name}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: `${colors.primary}10` }]}>
              <Text>📱</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.infoIcon, { backgroundColor: `${colors.primary}10` }]}>
              <Text>🏭</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Sector</Text>
              <Text style={styles.infoValue}>{user.sector}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={[styles.section, { marginTop: 16 }]}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: `${colors.primary}10` }]}>
                <Text>🔒</Text>
              </View>
              <Text style={styles.menuText}>Change Password</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
          <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: `${colors.accent}15` }]}>
                <Text>🌐</Text>
              </View>
              <Text style={styles.menuText}>Language</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: `${colors.primary}10` }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>Myanmar</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: `${colors.success}15` }]}>
                <Text>🔔</Text>
              </View>
              <Text style={styles.menuText}>Notifications</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: `${colors.success}15` }]}>
              <Text style={[styles.badgeText, { color: colors.success }]}>Enabled</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout */}
      <View style={{ padding: 16, paddingTop: 24 }}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Sign Out</Text>
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
    backgroundColor: colors.primary,
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
    paddingTop: 40,
    paddingBottom: 24,
    backgroundColor: colors.primary,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
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
    borderWidth: 4,
    borderColor: colors.surface,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: colors.textWhite,
  },
  statusBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  statusBadgeText: {
    color: colors.textWhite,
    fontSize: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textWhite,
    marginTop: 12,
  },
  business: {
    fontSize: 16,
    color: colors.textWhite,
    marginTop: 4,
    opacity: 0.9,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    padding: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  sectionBadge: {
    fontSize: 12,
    color: colors.textLight,
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  settingsCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  arrow: {
    color: colors.textLight,
    fontSize: 20,
  },
  logoutButton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.error,
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: "700",
  },
});
