import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import api from "../lib/api";
import { colors } from "../lib/colors";

export default function BankScreen() {
  const [smeList, setSmeList] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [sectors, setSectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [selectedSme, setSelectedSme] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchBankData();
  }, []);

  const fetchBankData = async () => {
    try {
      const [smeRes, statsRes, sectorRes] = await Promise.all([
        api.get("/api/bank/sme-list"),
        api.get("/api/bank/analytics/summary"),
        api.get("/api/bank/sector-breakdown"),
      ]);
      setSmeList(smeRes.data);
      setStats(statsRes.data);
      setSectors(sectorRes.data);
    } catch (error) {
      console.error("Failed to fetch bank data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSmeDetail = async (smeId: number) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/api/bank/sme/${smeId}`);
      setSelectedSme(res.data);
    } catch (error) {
      console.error("Failed to fetch SME detail:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredList = smeList.filter((sme) => {
    if (search) {
      const term = search.toLowerCase();
      if (!sme.business_name.toLowerCase().includes(term) &&
          !sme.owner_name.toLowerCase().includes(term)) return false;
    }
    if (riskFilter && sme.risk_level !== riskFilter) return false;
    return true;
  });

  const getRiskColor = (risk: string) => {
    if (risk === "low") return colors.success;
    if (risk === "medium") return colors.warning;
    return colors.error;
  };

  const renderSME = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.smeItem} onPress={() => fetchSmeDetail(item.id)}>
      <View style={styles.smeHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.smeName}>{item.business_name}</Text>
          <Text style={styles.smeOwner}>{item.owner_name} · {item.sector}</Text>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: `${getRiskColor(item.risk_level)}20` }]}>
          <Text style={[styles.riskText, { color: getRiskColor(item.risk_level) }]}>{item.risk_level}</Text>
        </View>
      </View>
      <View style={styles.smeStats}>
        <View style={styles.smeStatItem}>
          <Text style={styles.smeStatLabel}>Balance</Text>
          <Text style={[styles.smeStatValue, { color: item.balance < 0 ? colors.error : colors.textPrimary }]}>
            K {item.balance.toLocaleString()}
          </Text>
        </View>
        <View style={styles.smeStatItem}>
          <Text style={styles.smeStatLabel}>Income</Text>
          <Text style={[styles.smeStatValue, { color: colors.success }]}>K {item.total_income.toLocaleString()}</Text>
        </View>
        <View style={styles.smeStatItem}>
          <Text style={styles.smeStatLabel}>Tx</Text>
          <Text style={styles.smeStatValue}>{item.transaction_count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadingLogo}><Text style={styles.loadingIcon}>🏦</Text></View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bank Dashboard</Text>
        <Text style={styles.subtitle}>SME Monitoring</Text>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: `${colors.secondary}15` }]}>
              <Text style={[styles.statValue, { color: colors.secondary }]}>{stats.total_smes}</Text>
              <Text style={styles.statLabel}>Total SMEs</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: `${colors.success}15` }]}>
              <Text style={[styles.statValue, { color: colors.success }]}>{stats.active_smes}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: `${colors.error}15` }]}>
              <Text style={[styles.statValue, { color: colors.error }]}>{stats.high_risk_smes}</Text>
              <Text style={styles.statLabel}>High Risk</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: `${colors.accent}15` }]}>
              <Text style={[styles.statValue, { color: colors.accent }]}>K {stats.total_volume.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Volume</Text>
            </View>
          </View>
        </View>
      )}

      {/* Sector Summary */}
      <View style={styles.sectorContainer}>
        <Text style={styles.sectionTitle}>Sectors</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sectors.map((s) => (
            <View key={s.sector} style={styles.sectorChip}>
              <Text style={styles.sectorName}>{s.sector}</Text>
              <Text style={styles.sectorCount}>{s.count} SMEs</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Search & Filter */}
      <View style={styles.filterRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search SMEs..."
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <View style={styles.riskFilters}>
        {["", "low", "medium", "high"].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.riskFilterBtn, riskFilter === r && styles.riskFilterActive]}
            onPress={() => setRiskFilter(r)}
          >
            <Text style={[styles.riskFilterText, riskFilter === r && styles.riskFilterTextActive]}>
              {r === "" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredList}
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

      {/* Detail Modal */}
      <Modal visible={!!selectedSme || detailLoading} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {detailLoading ? (
              <View style={styles.modalLoading}>
                <Text style={{ fontSize: 32 }}>🏦</Text>
                <Text style={{ color: colors.textSecondary, marginTop: 8 }}>Loading...</Text>
              </View>
            ) : selectedSme && (
              <ScrollView>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>{selectedSme.sme.business_name}</Text>
                    <Text style={styles.modalSubtitle}>{selectedSme.sme.owner_name} · {selectedSme.sme.sector}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedSme(null)}>
                    <Text style={{ fontSize: 20, color: colors.textSecondary }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalStatsRow}>
                  <View style={[styles.modalStatBox, { backgroundColor: `${colors.success}15` }]}>
                    <Text style={styles.modalStatLabel}>Income</Text>
                    <Text style={[styles.modalStatValue, { color: colors.success }]}>K {selectedSme.sme.total_income.toLocaleString()}</Text>
                  </View>
                  <View style={[styles.modalStatBox, { backgroundColor: `${colors.error}15` }]}>
                    <Text style={styles.modalStatLabel}>Expense</Text>
                    <Text style={[styles.modalStatValue, { color: colors.error }]}>K {selectedSme.sme.total_expenses.toLocaleString()}</Text>
                  </View>
                  <View style={[styles.modalStatBox, { backgroundColor: `${colors.primary}15` }]}>
                    <Text style={styles.modalStatLabel}>Balance</Text>
                    <Text style={[styles.modalStatValue, { color: selectedSme.sme.balance < 0 ? colors.error : colors.primary }]}>K {selectedSme.sme.balance.toLocaleString()}</Text>
                  </View>
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Recent Transactions</Text>
                {selectedSme.transactions.slice(0, 8).map((t: any) => (
                  <View key={t.id} style={styles.txItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txCategory}>{t.category}</Text>
                      <Text style={styles.txDate}>{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Text>
                    </View>
                    <Text style={[styles.txAmount, { color: t.type === "income" ? colors.success : colors.error }]}>
                      {t.type === "income" ? "+" : "-"} K {t.amount.toLocaleString()}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  loadingLogo: { width: 80, height: 80, borderRadius: 20, backgroundColor: colors.accent, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  loadingIcon: { fontSize: 40 },
  loadingText: { color: colors.textSecondary, fontSize: 16 },
  header: { padding: 20, backgroundColor: colors.primary },
  title: { fontSize: 24, fontWeight: "bold", color: colors.textWhite },
  subtitle: { fontSize: 14, color: colors.textWhite, marginTop: 4, opacity: 0.9 },
  statsContainer: { padding: 16, paddingBottom: 8 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statBox: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "bold" },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  sectorContainer: { paddingHorizontal: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: colors.textPrimary, marginBottom: 10 },
  sectorChip: { backgroundColor: `${colors.primary}10`, borderRadius: 12, padding: 12, marginRight: 10, minWidth: 90, alignItems: "center" },
  sectorName: { fontSize: 12, fontWeight: "600", color: colors.primary },
  sectorCount: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  filterRow: { paddingHorizontal: 16, marginBottom: 8 },
  searchInput: { backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, fontSize: 14, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
  riskFilters: { flexDirection: "row", paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  riskFilterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: `${colors.primary}10` },
  riskFilterActive: { backgroundColor: colors.primary },
  riskFilterText: { fontSize: 12, color: colors.primary, fontWeight: "600" },
  riskFilterTextActive: { color: colors.textWhite },
  list: { padding: 16 },
  smeItem: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  smeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  smeName: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  smeOwner: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
  riskBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  riskText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  smeStats: { flexDirection: "row", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.borderLight },
  smeStatItem: { alignItems: "center" },
  smeStatLabel: { fontSize: 10, color: colors.textLight, marginBottom: 3 },
  smeStatValue: { fontSize: 13, fontWeight: "600", color: colors.textPrimary },
  emptyContainer: { alignItems: "center", marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: colors.textSecondary, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "85%" },
  modalLoading: { alignItems: "center", paddingVertical: 40 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: colors.textPrimary },
  modalSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 3 },
  modalStatsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  modalStatBox: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center" },
  modalStatLabel: { fontSize: 10, color: colors.textSecondary },
  modalStatValue: { fontSize: 13, fontWeight: "700", marginTop: 4 },
  txItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.background, padding: 12, borderRadius: 10, marginBottom: 8 },
  txCategory: { fontSize: 13, fontWeight: "600", color: colors.textPrimary },
  txDate: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  txAmount: { fontSize: 13, fontWeight: "700" },
});
