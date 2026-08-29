"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import Chart from "@/components/Chart";
import TransactionTable from "@/components/TransactionTable";
import api from "@/lib/api";
import { colors } from "@/lib/colors";

interface UserData {
  id: number; business_name: string; owner_name: string; role: string;
}

interface DashboardData {
  summary: { total_balance: number; monthly_income: number; monthly_expenses: number; };
  monthly: { months: string[]; income: number[]; expenses: number[]; };
  recentTransactions: any[];
}

interface LoanApp {
  id: number; amount: number; purpose: string; description?: string;
  duration_months: number; status: string; admin_notes?: string;
  created_at: string; reviewed_at?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loans, setLoans] = useState<LoanApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [loanDuration, setLoanDuration] = useState("12");
  const [loanDescription, setLoanDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { router.push("/login"); return; }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role === "bank_admin") { router.push("/bank"); return; }
    setUser(parsedUser);
    fetchDashboardData();
    fetchLoans();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summary, monthly, transactions] = await Promise.all([
        api.get("/api/dashboard/summary"),
        api.get("/api/dashboard/monthly-summary"),
        api.get("/api/transactions"),
      ]);
      setData({ summary: summary.data, monthly: monthly.data, recentTransactions: transactions.data.slice(0, 5) });
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchLoans = async () => {
    try { const res = await api.get("/api/loans"); setLoans(res.data); }
    catch (error) { console.error(error); }
  };

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanAmount || !loanPurpose) return;
    setSubmitting(true);
    try {
      await api.post("/api/loans", {
        amount: parseFloat(loanAmount),
        purpose: loanPurpose,
        description: loanDescription || undefined,
        duration_months: parseInt(loanDuration),
      });
      setShowLoanModal(false);
      setLoanAmount(""); setLoanPurpose(""); setLoanDescription(""); setLoanDuration("12");
      fetchLoans();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Failed to submit loan application");
    } finally { setSubmitting(false); }
  };

  const getStatusColor = (status: string) => status === "approved" ? colors.success : status === "rejected" ? colors.error : colors.warning;
  const pendingLoan = loans.find(l => l.status === "pending");

  if (loading || !user || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse" style={{ backgroundColor: colors.primary }}>🏦</div>
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
          <div className="rounded-xl p-6 mb-6" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)` }}>
            <h1 className="text-2xl font-bold" style={{ color: colors.textWhite }}>Welcome back, {user.owner_name}! 👋</h1>
            <p className="mt-1" style={{ color: colors.textWhite }}>{user.business_name} • Here&apos;s your financial overview</p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            <StatsCard title="Total Balance" value={`K ${data.summary.total_balance.toLocaleString()}`} icon="💰" />
            <StatsCard title="Monthly Income" value={`K ${data.summary.monthly_income.toLocaleString()}`} subtitle="This month" icon="📈" trend="up" trendValue="+12%" />
            <StatsCard title="Monthly Expenses" value={`K ${data.summary.monthly_expenses.toLocaleString()}`} subtitle="This month" icon="📉" />
          </div>

          <div className="mb-6"><Chart data={data.monthly} /></div>

          <div className="grid grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>Recent Transactions</h2>
              <TransactionTable transactions={data.recentTransactions} />
            </div>

            {/* Loan Applications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>My Loans</h2>
                <button onClick={() => setShowLoanModal(true)} disabled={!!pendingLoan}
                  className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: colors.accent, color: colors.textWhite }}>
                  {pendingLoan ? "Pending..." : "+ Apply"}
                </button>
              </div>

              <div className="space-y-3">
                {loans.length === 0 && (
                  <div className="rounded-xl p-6 text-center" style={{ backgroundColor: colors.surface }}>
                    <p className="text-3xl mb-2">💰</p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>No loan applications yet</p>
                  </div>
                )}
                {loans.map((loan) => (
                  <div key={loan.id} className="rounded-xl p-4" style={{ backgroundColor: colors.surface }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{loan.purpose}</span>
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full" style={{ backgroundColor: `${getStatusColor(loan.status)}20`, color: getStatusColor(loan.status) }}>{loan.status}</span>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg font-bold" style={{ color: colors.primary }}>K {loan.amount.toLocaleString()}</span>
                      <span className="text-xs" style={{ color: colors.textLight }}>{loan.duration_months} months</span>
                    </div>
                    {loan.description && <p className="text-xs mt-1" style={{ color: colors.textLight }}>{loan.description}</p>}
                    {loan.admin_notes && (
                      <div className="mt-2 p-2 rounded-lg text-xs" style={{ backgroundColor: `${colors.primary}10`, color: colors.textSecondary }}>
                        <strong>Bank:</strong> {loan.admin_notes}
                      </div>
                    )}
                    <p className="text-xs mt-2" style={{ color: colors.textLight }}>
                      Applied {new Date(loan.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Loan Application Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLoanModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl shadow-2xl p-6" style={{ backgroundColor: colors.surface }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Apply for Loan</h2>
              <button onClick={() => setShowLoanModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100" style={{ color: colors.textSecondary }}>✕</button>
            </div>
            <form onSubmit={handleApplyLoan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Amount (MMK)</label>
                <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} placeholder="e.g. 500000" min="10000" step="10000" required
                  className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2" style={{ borderColor: colors.border, color: colors.textPrimary }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Purpose</label>
                <select value={loanPurpose} onChange={(e) => setLoanPurpose(e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none" style={{ borderColor: colors.border, color: colors.textPrimary }}>
                  <option value="">Select purpose</option>
                  <option value="Working Capital">Working Capital</option>
                  <option value="Equipment Purchase">Equipment Purchase</option>
                  <option value="Branch Expansion">Branch Expansion</option>
                  <option value="Inventory Purchase">Inventory Purchase</option>
                  <option value="Renovation">Renovation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Duration</label>
                <select value={loanDuration} onChange={(e) => setLoanDuration(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none" style={{ borderColor: colors.border, color: colors.textPrimary }}>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="18">18 months</option>
                  <option value="24">24 months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Description <span className="opacity-50">(optional)</span></label>
                <textarea value={loanDescription} onChange={(e) => setLoanDescription(e.target.value)} rows={3} placeholder="Explain how you plan to use the loan..."
                  className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2" style={{ borderColor: colors.border, color: colors.textPrimary }} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowLoanModal(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all hover:bg-gray-50"
                  style={{ borderColor: colors.border, color: colors.textSecondary }}>Cancel</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: colors.primary, color: colors.textWhite }}>
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
