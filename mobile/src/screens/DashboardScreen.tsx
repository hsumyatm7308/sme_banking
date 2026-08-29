import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  TouchableOpacity, TextInput, Modal, Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../lib/api";
import { colors } from "../lib/colors";

const PURPOSES = ["Working Capital", "Equipment Purchase", "Branch Expansion", "Inventory Purchase", "Renovation", "Other"];

export default function DashboardScreen() {
  const [user, setUser] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [loanDuration, setLoanDuration] = useState("12");
  const [loanDescription, setLoanDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const userData = await AsyncStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    try {
      const [summaryRes, txRes, loanRes] = await Promise.all([
        api.get("/api/dashboard/summary"),
        api.get("/api/transactions"),
        api.get("/api/loans"),
      ]);
      setSummary(summaryRes.data);
      setTransactions(txRes.data.slice(0, 5));
      setLoans(loanRes.data);
    } catch (error) { console.error(error); }
  };

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const handleApplyLoan = async () => {
    if (!loanAmount || !loanPurpose) return;
    setSubmitting(true);
    try {
      await api.post("/api/loans", {
        amount: parseFloat(loanAmount), purpose: loanPurpose,
        description: loanDescription || undefined, duration_months: parseInt(loanDuration),
      });
      setShowLoanModal(false); setLoanAmount(""); setLoanPurpose(""); setLoanDescription("");
      loadData();
    } catch (error: any) { Alert.alert("Error", error.response?.data?.detail || "Failed"); }
    finally { setSubmitting(false); }
  };

  const getStatusColor = (s: string) => s === "approved" ? colors.success : s === "rejected" ? colors.error : colors.warning;
  const pendingLoan = loans.find((l: any) => l.status === "pending");

  if (!user || !summary) {
    return (<View style={styles.loading}><View style={styles.loadingLogo}><Text style={styles.loadingIcon}>🏦</Text></View><Text style={styles.loadingText}>Loading...</Text></View>);
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {user.owner_name}! 👋</Text>
        <Text style={styles.business}>{user.business_name}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.balanceCard}>
          <Text style={styles.statLabel}>Total Balance</Text>
          <Text style={styles.balanceValue}>K {summary.total_balance.toLocaleString()}</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.incomeValue}>K {summary.monthly_income.toLocaleString()}</Text>
            <Text style={styles.statSubtext}>This month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📉</Text>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.expenseValue}>K {summary.monthly_expenses.toLocaleString()}</Text>
            <Text style={styles.statSubtext}>This month</Text>
          </View>
        </View>
      </View>

      {/* Loans Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Loans</Text>
          <TouchableOpacity style={[styles.applyBtn, !!pendingLoan && styles.applyBtnDisabled]}
            onPress={() => setShowLoanModal(true)} disabled={!!pendingLoan}>
            <Text style={styles.applyBtnText}>{pendingLoan ? "Pending..." : "+ Apply"}</Text>
          </TouchableOpacity>
        </View>
        {loans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>💰</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>No loan applications yet</Text>
          </View>
        ) : loans.map((loan: any) => (
          <View key={loan.id} style={styles.loanCard}>
            <View style={styles.loanHeader}>
              <Text style={styles.loanPurpose}>{loan.purpose}</Text>
              <View style={[styles.loanBadge, { backgroundColor: `${getStatusColor(loan.status)}20` }]}>
                <Text style={[styles.loanBadgeText, { color: getStatusColor(loan.status) }]}>{loan.status}</Text>
              </View>
            </View>
            <Text style={styles.loanAmount}>K {loan.amount.toLocaleString()}</Text>
            <Text style={styles.loanDuration}>{loan.duration_months} months</Text>
            {loan.admin_notes && (
              <View style={styles.loanNote}><Text style={styles.loanNoteText}>Bank: {loan.admin_notes}</Text></View>
            )}
          </View>
        ))}
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.map((t) => (
          <View key={t.id} style={styles.transactionItem}>
            <View style={styles.transactionInfo}>
              <View style={[styles.typeIndicator, { backgroundColor: t.type === "income" ? colors.success : colors.error }]} />
              <View>
                <Text style={styles.transactionCategory}>{t.category}</Text>
                <Text style={styles.transactionDate}>{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</Text>
              </View>
            </View>
            <Text style={[styles.transactionAmount, { color: t.type === "income" ? colors.success : colors.error }]}>
              {t.type === "income" ? "+" : "-"} K {t.amount.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Loan Modal */}
      <Modal visible={showLoanModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Apply for Loan</Text>
            <TextInput style={styles.input} placeholder="Amount (MMK)" placeholderTextColor={colors.textLight}
              keyboardType="numeric" value={loanAmount} onChangeText={setLoanAmount} />
            <Text style={styles.inputLabel}>Purpose</Text>
            <View style={styles.purposeGrid}>
              {PURPOSES.map((p) => (
                <TouchableOpacity key={p} style={[styles.purposeChip, loanPurpose === p && styles.purposeChipActive]}
                  onPress={() => setLoanPurpose(p)}>
                  <Text style={[styles.purposeChipText, loanPurpose === p && styles.purposeChipTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Description (optional)" placeholderTextColor={colors.textLight}
              value={loanDescription} onChangeText={setLoanDescription} multiline />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLoanModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleApplyLoan} disabled={submitting}>
                <Text style={styles.saveBtnText}>{submitting ? "Submitting..." : "Submit"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background },
  loadingLogo: { width: 80, height: 80, borderRadius: 20, backgroundColor: colors.secondary, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  loadingIcon: { fontSize: 40 },
  loadingText: { color: colors.textSecondary, fontSize: 16 },
  header: { padding: 24, paddingTop: 20, backgroundColor: colors.primary },
  greeting: { fontSize: 26, fontWeight: "bold", color: colors.textWhite },
  business: { fontSize: 16, color: colors.textWhite, marginTop: 6, opacity: 0.9 },
  statsContainer: { padding: 20 },
  statsRow: { flexDirection: "row", gap: 16 },
  balanceCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, marginBottom: 16, elevation: 5 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 20, elevation: 5 },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: "500" },
  balanceValue: { fontSize: 32, fontWeight: "bold", color: colors.primary, marginTop: 8 },
  incomeValue: { fontSize: 20, fontWeight: "bold", color: colors.success, marginTop: 8 },
  expenseValue: { fontSize: 20, fontWeight: "bold", color: colors.error, marginTop: 8 },
  statSubtext: { fontSize: 12, color: colors.textLight, marginTop: 6 },
  section: { padding: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: colors.textPrimary },
  applyBtn: { backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  applyBtnDisabled: { opacity: 0.5 },
  applyBtnText: { color: colors.textWhite, fontWeight: "700", fontSize: 13 },
  emptyCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, alignItems: "center", elevation: 2 },
  loanCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  loanHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  loanPurpose: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  loanBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  loanBadgeText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  loanAmount: { fontSize: 20, fontWeight: "bold", color: colors.primary },
  loanDuration: { fontSize: 12, color: colors.textLight, marginTop: 4 },
  loanNote: { backgroundColor: `${colors.primary}10`, borderRadius: 8, padding: 10, marginTop: 10 },
  loanNoteText: { fontSize: 12, color: colors.textSecondary },
  transactionItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.surface, padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
  transactionInfo: { flexDirection: "row", alignItems: "center", gap: 14 },
  typeIndicator: { width: 4, height: 44, borderRadius: 2 },
  transactionCategory: { fontSize: 16, fontWeight: "600", color: colors.textPrimary },
  transactionDate: { fontSize: 12, color: colors.textLight, marginTop: 4 },
  transactionAmount: { fontSize: 16, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "85%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: colors.textPrimary, marginBottom: 20 },
  input: { backgroundColor: colors.background, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, fontSize: 14, color: colors.textPrimary, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  inputLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  purposeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  purposeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: `${colors.primary}10` },
  purposeChipActive: { backgroundColor: colors.primary },
  purposeChipText: { fontSize: 12, color: colors.primary, fontWeight: "500" },
  purposeChipTextActive: { color: colors.textWhite },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center" },
  saveBtnText: { fontSize: 14, fontWeight: "600", color: colors.textWhite },
});
