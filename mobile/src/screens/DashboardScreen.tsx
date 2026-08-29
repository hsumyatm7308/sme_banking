import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../lib/api";
import { colors } from "../lib/colors";

export default function DashboardScreen() {
  const [user, setUser] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        api.get("/api/dashboard/summary"),
        api.get("/api/transactions"),
      ]);
      setSummary(summaryRes.data);
      setTransactions(transactionsRes.data.slice(0, 5));
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (!user || !summary) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadingLogo}>
          <Text style={styles.loadingIcon}>🏦</Text>
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user.owner_name}! 👋</Text>
        <Text style={styles.business}>{user.business_name}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.balanceCard}>
          <Text style={styles.statLabel}>Total Balance</Text>
          <Text style={styles.balanceValue}>
            K {summary.total_balance.toLocaleString()}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.incomeValue}>
              K {summary.monthly_income.toLocaleString()}
            </Text>
            <Text style={styles.statSubtext}>This month</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📉</Text>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.expenseValue}>
              K {summary.monthly_expenses.toLocaleString()}
            </Text>
            <Text style={styles.statSubtext}>This month</Text>
          </View>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.map((t) => (
          <View key={t.id} style={styles.transactionItem}>
            <View style={styles.transactionInfo}>
              <View
                style={[
                  styles.typeIndicator,
                  { backgroundColor: t.type === "income" ? colors.success : colors.error },
                ]}
              />
              <View>
                <Text style={styles.transactionCategory}>{t.category}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(t.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                { color: t.type === "income" ? colors.success : colors.error },
              ]}
            >
              {t.type === "income" ? "+" : "-"} K {t.amount.toLocaleString()}
            </Text>
          </View>
        ))}
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
    padding: 24,
    paddingTop: 20,
    backgroundColor: colors.primary,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.textWhite,
  },
  business: {
    fontSize: 16,
    color: colors.textWhite,
    marginTop: 6,
    opacity: 0.9,
  },
  statsContainer: {
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    marginTop: 8,
  },
  incomeValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.success,
    marginTop: 8,
  },
  expenseValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.error,
    marginTop: 8,
  },
  statSubtext: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 6,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  typeIndicator: {
    width: 4,
    height: 44,
    borderRadius: 2,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
});
