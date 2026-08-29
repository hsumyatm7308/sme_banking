"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TransactionTable from "@/components/TransactionTable";
import TransactionFormModal from "@/components/TransactionFormModal";
import api from "@/lib/api";
import { colors } from "@/lib/colors";

interface Transaction {
  id: number;
  type: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

interface TransactionStats {
  total_income: number;
  total_expense: number;
  net_balance: number;
  transaction_count: number;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
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

  const handleSave = async (data: any) => {
    try {
      if (data.id) {
        await api.put(`/api/transactions/${data.id}`, data);
      } else {
        await api.post("/api/transactions", data);
      }
      fetchData();
    } catch (error) {
      console.error("Failed to save transaction:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/transactions/${id}`);
      setDeleteConfirm(null);
      fetchData();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setModalOpen(true);
  };

  if (loading || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse"
            style={{ backgroundColor: colors.primary }}
          >
            📋
          </div>
          <p style={{ color: colors.textSecondary }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: colors.background }}>
      <Sidebar role={user.role} />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: colors.textPrimary }}
              >
                Transactions
              </h1>
              <p style={{ color: colors.textSecondary }}>
                Manage and track your financial activity
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 flex items-center gap-2"
              style={{
                backgroundColor: colors.primary,
                color: colors.textWhite,
              }}
            >
              <span className="text-lg">+</span> Add Transaction
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: `${colors.success}10` }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Total Income
                </p>
                <p className="text-xl font-bold" style={{ color: colors.success }}>
                  K {stats.total_income.toLocaleString()}
                </p>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: `${colors.error}10` }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Total Expense
                </p>
                <p className="text-xl font-bold" style={{ color: colors.error }}>
                  K {stats.total_expense.toLocaleString()}
                </p>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: `${colors.primary}10` }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Net Balance
                </p>
                <p className="text-xl font-bold" style={{ color: colors.primary }}>
                  K {stats.net_balance.toLocaleString()}
                </p>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: `${colors.accent}10` }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>
                  Transactions
                </p>
                <p className="text-xl font-bold" style={{ color: colors.accent }}>
                  {stats.transaction_count}
                </p>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex gap-3 mb-6 items-center">
            <div className="relative flex-1 max-w-md">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: colors.textLight }}
              >
                🔍
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border text-sm focus:outline-none"
              style={{
                borderColor: colors.border,
                color: colors.textPrimary,
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div className="flex gap-2 ml-auto">
              {["all", "income", "expense"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    backgroundColor:
                      filter === type
                        ? colors.primary
                        : `${colors.primary}10`,
                    color: filter === type ? colors.textWhite : colors.primary,
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Table */}
          <TransactionTable
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onDelete={(id) => setDeleteConfirm(id)}
          />
        </main>
      </div>

      {/* Add/Edit Modal */}
      <TransactionFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSave}
        transaction={editingTransaction}
      />

      {/* Delete Confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteConfirm(null)}
          />
          <div
            className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🗑️</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: colors.textPrimary }}>
                Delete Transaction?
              </h3>
              <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all hover:bg-gray-50"
                  style={{
                    borderColor: colors.border,
                    color: colors.textSecondary,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                  style={{
                    backgroundColor: colors.error,
                    color: colors.textWhite,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
