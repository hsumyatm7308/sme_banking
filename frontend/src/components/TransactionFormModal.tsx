"use client";

import { useState, useEffect } from "react";
import { colors } from "@/lib/colors";

interface TransactionData {
  id?: number;
  type: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TransactionData) => void;
  transaction?: TransactionData | null;
}

const INCOME_CATEGORIES = ["Sales", "Service Revenue", "Investment Returns", "Other Income"];
const EXPENSE_CATEGORIES = ["Rent", "Salary", "Supplies", "Utilities", "Marketing", "Transport", "Other Expense"];

export default function TransactionFormModal({ isOpen, onClose, onSave, transaction }: Props) {
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setDescription(transaction.description || "");
      setDate(transaction.date);
    } else {
      setType("income");
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [transaction, isOpen]);

  useEffect(() => {
    if (!transaction) {
      const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      if (!cats.includes(category)) {
        setCategory("");
      }
    }
  }, [type]);

  if (!isOpen) return null;

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) return;
    onSave({
      ...(transaction?.id ? { id: transaction.id } : {}),
      type,
      amount: parseFloat(amount),
      category,
      description: description || undefined,
      date,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl p-6"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            style={{ color: colors.textSecondary }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Type
            </label>
            <div className="flex gap-2">
              {["income", "expense"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: type === t
                      ? t === "income" ? `${colors.success}20` : `${colors.error}20`
                      : `${colors.primary}08`,
                    color: type === t
                      ? t === "income" ? colors.success : colors.error
                      : colors.textSecondary,
                    border: `1px solid ${type === t
                      ? t === "income" ? colors.success : colors.error
                      : colors.border}`,
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Amount (MMK)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="1000"
              required
              className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: colors.border,
                color: colors.textPrimary,
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: colors.border,
                color: colors.textPrimary,
              }}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: colors.border,
                color: colors.textPrimary,
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Description <span className="opacity-50">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor: colors.border,
                color: colors.textPrimary,
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all hover:bg-gray-50"
              style={{
                borderColor: colors.border,
                color: colors.textSecondary,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
              style={{
                backgroundColor: colors.primary,
                color: colors.textWhite,
              }}
            >
              {transaction ? "Update" : "Add"} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
