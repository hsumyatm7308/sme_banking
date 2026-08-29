import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";
import api from "../lib/api";
import { colors } from "../lib/colors";

export default function BankScreen() {
  const [smeList, setSmeList] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBankData();
  }, []);

  const fetchBankData = async () => {
    try {
      const [smeListRes, statsRes] = await Promise.all([
        api.get("/api/bank/sme-list"),
        api.get("/api/bank/analytics/summary"),
      ]);
      setSmeList(smeListRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to fetch bank data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return colors.success;
      case "medium":
        return colors.warning;
      case "high":
        return colors.error;
      default:
        return colors.textLight;
    }
  };

  const renderSME = ({ item }: { item: any }) => (
    <View style={styles.smeItem}>
      <View style={styles.smeHeader}>
        <View>
          <Text style={styles.smeName}>{item.business_name}</Text>
          <Text style={styles.smeOwner}>{item.owner_name}</Text>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(item.risk_level)}20` }]}>
          <Text style={[styles.riskText, { color: getRiskColor(item.risk_level) }]}>
            {item.risk_level}
          </Text>
        </View>
      </View>
      <View style={styles.smeStats}>
        <View style={styles.smeStatItem}>
          <Text style={styles.smeStatLabel}>Sector</Text>
          <Text style={styles.smeStatValue}>{item.sector}</Text>
        </View>
        <View style={styles.smeStatItem}>
          <Text style={styles.smeStatLabel}>Balance</Text>
          <Text style={styles.smeStatValue}>K {item.balance.toLocaleString()}</Text>
        </View>
        <View style={styles.smeStatItem}>
          <Text style={styles.smeStatLabel}>Transactions</Text>
          <Text style={styles.smeStatValue}>{item.transaction_count}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Bank Dashboard</Text>
        <Text style={styles.subtitle}>SME Monitoring & Analytics</Text>
      </View>

      {/* Stats */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: `${colors.secondary}15` }]}>
              <Text style={[styles.statValue, { color: colors.secondary }]}>
                {stats.total_smes}
              </Text>
              <Text style={styles.statLabel}>Total SMEs</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: `${colors.success}15` }]}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {stats.active_smes}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: `${colors.error}15` }]}>
              <Text style={[styles.statValue, { color: colors.error }]}>
                {stats.high_risk_smes}
              </Text>
              <Text style={styles.statLabel}>High Risk</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: `${colors.accent}15` }]}>
              <Text style={[styles.statValue, { color: colors.accent }]}>
                K {stats.total_volume.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Volume</Text>
            </View>
          </View>
        </View>
      )}

      {/* SME List */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>SME List</Text>
        <FlatList
          data={smeList}
          renderItem={renderSME}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏢</Text>
              <Text style={styles.emptyText}>No SMEs found</Text>
            </View>
          }
        />
      </View>
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
    backgroundColor: colors.accent,
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
    padding: 20,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textWhite,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textWhite,
    marginTop: 4,
    opacity: 0.9,
  },
  statsContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  smeItem: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  smeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  smeName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  smeOwner: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  riskBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  smeStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  smeStatItem: {
    alignItems: "center",
  },
  smeStatLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 4,
  },
  smeStatValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
