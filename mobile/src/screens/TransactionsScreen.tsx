import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import api from "../lib/api";
import { colors } from "../lib/colors";

const INCOME_CATEGORIES = ["Sales", "Service Revenue", "Investment Returns", "Other Income"];
const EXPENSE_CATEGORIES = ["Rent", "Salary", "Supplies", "Utilities", "Marketing", "Transport", "Other Expense"];

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTx, setEditingTx] = useState<any>(null);

  // Form state
  const [formType, setFormType] = useState("income");
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [txRes, catRes, statsRes] = await Promise.all([
        api.get("/api/transactions"),
        api.get("/api/transactions/categories"),
        api.get("/api/transactions/stats"),
      ]);
      setTransactions(txRes.data);
      setCategories(catRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter !== "all" && t.type !== filter) return false;
    if (categoryFilter && t.category !== categoryFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        t.category.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const openAddModal = () => {
    setEditingTx(null);
    setFormType("income");
    setFormAmount("");
    setFormCategory("");
    setFormDescription("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setModalVisible(true);
  };

  const openEditModal = (tx: any) => {
    setEditingTx(tx);
    setFormType(tx.type);
    setFormAmount(tx.amount.toString());
    setFormCategory(tx.category);
    setFormDescription(tx.description || "");
    setFormDate(tx.date);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formAmount || !formCategory || !formDate) return;
    const data = {
      type: formType,
      amount: parseFloat(formAmount),
      category: formCategory,
      description: formDescription || undefined,
      date: formDate,
    };
    try {
      if (editingTx) {
        await api.put(`/api/transactions/${editingTx.id}`, data);
      } else {
        await api.post("/api/transactions", data);
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete Transaction", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/transactions/${id}`);
            fetchData();
          } catch (error) {
            console.error("Failed to delete:", error);
          }
        },
      },
    ]);
  };

  const formCategories = formType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const renderStats = () => {
    if (!stats) return null;
    return (
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: `${colors.success}15` }]}>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>
            K {stats.total_income.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: `${colors.error}15` }]}>
          <Text style={styles.statLabel}>Expense</Text>
          <Text style={[styles.statValue, { color: colors.error }]}>
            K {stats.total_expense.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: `${colors.primary}15` }]}>
          <Text style={styles.statLabel}>Net</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            K {stats.net_balance.toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => openEditModal(item)}
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={styles.transactionInfo}>
        <View
          style={[
            styles.typeIndicator,
            { backgroundColor: item.type === "income" ? colors.success : colors.error },
          ]}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.date}>
            {new Date(item.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
            {item.description ? ` · ${item.description}` : ""}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.amount,
          { color: item.type === "income" ? colors.success : colors.error },
        ]}
      >
        {item.type === "income" ? "+" : "-"} K {item.amount.toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Transactions</Text>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderStats()}

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filters}>
        {["all", "income", "expense"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterButton, filter === type && styles.filterActive]}
            onPress={() => setFilter(type)}
          >
            <Text
              style={[
                styles.filterText,
                filter === type && styles.filterTextActive,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTx ? "Edit Transaction" : "Add Transaction"}
            </Text>

            <View style={styles.typeToggle}>
              {["income", "expense"].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeButton,
                    formType === t && {
                      backgroundColor: t === "income" ? `${colors.success}20` : `${colors.error}20`,
                      borderColor: t === "income" ? colors.success : colors.error,
                    },
                  ]}
                  onPress={() => {
                    setFormType(t);
                    setFormCategory("");
                  }}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formType === t && {
                        color: t === "income" ? colors.success : colors.error,
                      },
                    ]}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Amount (MMK)"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              value={formAmount}
              onChangeText={setFormAmount}
            />

            <View style={styles.categoryGrid}>
              {formCategories.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.categoryChip,
                    formCategory === c && styles.categoryChipActive,
                  ]}
                  onPress={() => setFormCategory(c)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      formCategory === c && styles.categoryChipTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor={colors.textLight}
              value={formDate}
              onChangeText={setFormDate}
            />

            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textLight}
              value={formDescription}
              onChangeText={setFormDescription}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {editingTx ? "Update" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 20,
    backgroundColor: colors.primary,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textWhite,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 22,
    color: colors.textWhite,
    fontWeight: "bold",
    marginTop: -2,
  },
  statsRow: {
    flexDirection: "row",
    padding: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  searchRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: `${colors.primary}10`,
  },
  filterActive: {
    backgroundColor: colors.secondary,
  },
  filterText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  filterTextActive: {
    color: colors.textWhite,
  },
  list: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  typeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  category: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 3,
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 20,
  },
  typeToggle: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: `${colors.primary}10`,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: colors.textWhite,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textWhite,
  },
});
