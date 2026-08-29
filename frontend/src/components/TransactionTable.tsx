"use client";

import { colors } from "@/lib/colors";

interface Transaction {
  id: number;
  type: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

interface Props {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: number) => void;
}

export default function TransactionTable({ transactions, onEdit, onDelete }: Props) {
  return (
    <div
      className="rounded-xl shadow-md overflow-hidden"
      style={{ backgroundColor: colors.surface }}
    >
      <table className="w-full">
        <thead>
          <tr style={{ backgroundColor: `${colors.primary}10` }}>
            <th
              className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
              style={{ color: colors.primary }}
            >
              Date
            </th>
            <th
              className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
              style={{ color: colors.primary }}
            >
              Type
            </th>
            <th
              className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
              style={{ color: colors.primary }}
            >
              Category
            </th>
            <th
              className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
              style={{ color: colors.primary }}
            >
              Description
            </th>
            <th
              className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider"
              style={{ color: colors.primary }}
            >
              Amount
            </th>
            <th
              className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider"
              style={{ color: colors.primary }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: colors.borderLight }}>
          {transactions.map((t) => (
            <tr
              key={t.id}
              className="transition-colors hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                  {new Date(t.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className="px-3 py-1 text-xs font-semibold rounded-full"
                  style={{
                    backgroundColor:
                      t.type === "income"
                        ? `${colors.success}20`
                        : `${colors.error}20`,
                    color: t.type === "income" ? colors.success : colors.error,
                  }}
                >
                  {t.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm" style={{ color: colors.textSecondary }}>
                  {t.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm" style={{ color: colors.textLight }}>
                  {t.description || "—"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: t.type === "income" ? colors.success : colors.error,
                  }}
                >
                  {t.type === "income" ? "+" : "-"} K{" "}
                  {t.amount.toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(t)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:opacity-80"
                      style={{
                        backgroundColor: `${colors.primary}10`,
                        color: colors.primary,
                      }}
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(t.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:opacity-80"
                      style={{
                        backgroundColor: `${colors.error}10`,
                        color: colors.error,
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {transactions.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            No transactions found
          </p>
        </div>
      )}
    </div>
  );
}
