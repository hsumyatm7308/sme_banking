"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import api from "@/lib/api";
import { colors } from "@/lib/colors";

interface SMESummary {
  id: number; business_name: string; owner_name: string; sector: string;
  total_income: number; total_expenses: number; balance: number;
  risk_level: string; transaction_count: number; phone: string;
}

interface SMEDetail {
  sme: { id: number; business_name: string; owner_name: string; sector: string; phone: string;
    created_at: string; total_income: number; total_expenses: number; balance: number; risk_level: string; };
  monthly: { month: string; income: number; expense: number }[];
  transactions: { id: number; type: string; amount: number; category: string; description?: string; date: string }[];
}

interface LoanApp {
  id: number; user_id: number; amount: number; purpose: string; description?: string;
  duration_months: number; status: string; admin_notes?: string;
  reviewed_at?: string; created_at: string;
  business_name?: string; owner_name?: string; sector?: string;
}

interface SectorData { sector: string; count: number; total_volume: number; }
interface MonthlyTrend { month: string; income: number; expense: number; }

const PIE_COLORS = ["#1E3A5F", "#0D47A1", "#FF9800", "#4CAF50", "#E53935", "#9C27B0", "#00BCD4", "#795548", "#607D8B"];

export default function BankPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"sme" | "loans">("sme");
  const [smeList, setSmeList] = useState<SMESummary[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [loans, setLoans] = useState<LoanApp[]>([]);
  const [loanStats, setLoanStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [loanStatusFilter, setLoanStatusFilter] = useState("");
  const [selectedSme, setSelectedSme] = useState<SMEDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reviewingLoan, setReviewingLoan] = useState<LoanApp | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { router.push("/login"); return; }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    if (parsedUser.role !== "bank_admin") { router.push("/"); return; }
    fetchBankData();
    fetchLoans();
  }, []);

  const fetchBankData = async () => {
    try {
      const [smeRes, statsRes, sectorRes, trendRes] = await Promise.all([
        api.get("/api/bank/sme-list"),
        api.get("/api/bank/analytics/summary"),
        api.get("/api/bank/sector-breakdown"),
        api.get("/api/bank/monthly-trends"),
      ]);
      setSmeList(smeRes.data); setStats(statsRes.data);
      setSectors(sectorRes.data); setTrends(trendRes.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchLoans = async () => {
    try {
      const [loanRes, statsRes] = await Promise.all([
        api.get("/api/loans/all"),
        api.get("/api/loans/stats"),
      ]);
      setLoans(loanRes.data); setLoanStats(statsRes.data);
    } catch (error) { console.error(error); }
  };

  const fetchSmeDetail = async (smeId: number) => {
    setDetailLoading(true);
    try { const res = await api.get(`/api/bank/sme/${smeId}`); setSelectedSme(res.data); }
    catch (error) { console.error(error); } finally { setDetailLoading(false); }
  };

  const handleReviewLoan = async (loanId: number, status: string) => {
    setReviewLoading(true);
    try {
      await api.put(`/api/loans/${loanId}/review`, { status, admin_notes: reviewNotes });
      setReviewingLoan(null); setReviewNotes("");
      fetchLoans();
    } catch (error) { console.error(error); } finally { setReviewLoading(false); }
  };

  const filteredSmeList = smeList.filter((sme) => {
    if (search) {
      const t = search.toLowerCase();
      if (!sme.business_name.toLowerCase().includes(t) && !sme.owner_name.toLowerCase().includes(t) && !sme.sector.toLowerCase().includes(t)) return false;
    }
    if (sectorFilter && sme.sector !== sectorFilter) return false;
    if (riskFilter && sme.risk_level !== riskFilter) return false;
    return true;
  });

  const filteredLoans = loans.filter((l) => {
    if (loanStatusFilter && l.status !== loanStatusFilter) return false;
    return true;
  });

  const getRiskColor = (risk: string) => risk === "low" ? colors.success : risk === "medium" ? colors.warning : colors.error;
  const getStatusColor = (status: string) => status === "approved" ? colors.success : status === "rejected" ? colors.error : colors.warning;
  const uniqueSectors = [...new Set(smeList.map(s => s.sector))];
  const pieData = sectors.map(s => ({ name: s.sector, value: s.total_volume }));

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse" style={{ backgroundColor: colors.accent }}>🏦</div>
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
          {/* Header + Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>Bank Dashboard</h1>
              <p style={{ color: colors.textSecondary }}>SME Monitoring & Loan Management</p>
            </div>
            <div className="flex gap-2 p-1 rounded-xl" style={{ backgroundColor: `${colors.primary}10` }}>
              {(["sme", "loans"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{ backgroundColor: activeTab === tab ? colors.primary : "transparent", color: activeTab === tab ? colors.textWhite : colors.primary }}>
                  {tab === "sme" ? "🏢 SMEs" : "💰 Loans"}
                </button>
              ))}
            </div>
          </div>

          {/* ========== SME TAB ========== */}
          {activeTab === "sme" && (
            <>
              {stats && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <StatsCard title="Total SMEs" value={stats.total_smes.toString()} icon="🏢" />
                  <StatsCard title="Active SMEs" value={stats.active_smes.toString()} icon="✅" />
                  <StatsCard title="High Risk" value={stats.high_risk_smes.toString()} icon="⚠️" />
                  <StatsCard title="Total Volume" value={`K ${stats.total_volume.toLocaleString()}`} icon="💹" />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="col-span-2 rounded-xl p-6 shadow-md" style={{ backgroundColor: colors.surface }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>Monthly Transaction Trends</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={trends} barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis dataKey="month" tick={{ fill: colors.textSecondary, fontSize: 11 }} axisLine={{ stroke: colors.border }} />
                      <YAxis tick={{ fill: colors.textSecondary, fontSize: 11 }} axisLine={{ stroke: colors.border }} />
                      <Tooltip contentStyle={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8 }} />
                      <Legend />
                      <Bar dataKey="income" fill={colors.chartIncome} radius={[4, 4, 0, 0]} name="Income" />
                      <Bar dataKey="expense" fill={colors.chartExpense} radius={[4, 4, 0, 0]} name="Expense" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="rounded-xl p-6 shadow-md" style={{ backgroundColor: colors.surface }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>By Sector</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any) => `K ${Number(v).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {sectors.map((s, i) => (
                      <div key={s.sector} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span style={{ color: colors.textSecondary }}>{s.sector}</span>
                        </div>
                        <span style={{ color: colors.textPrimary }}>{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-4 items-center">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search SMEs..."
                  className="flex-1 max-w-sm px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2" style={{ borderColor: colors.border, color: colors.textPrimary }} />
                <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border text-sm focus:outline-none" style={{ borderColor: colors.border, color: colors.textPrimary }}>
                  <option value="">All Sectors</option>
                  {uniqueSectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="flex gap-2">
                  {["", "low", "medium", "high"].map((r) => (
                    <button key={r} onClick={() => setRiskFilter(r)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{ backgroundColor: riskFilter === r ? (r === "" ? colors.primary : getRiskColor(r)) : `${colors.primary}10`, color: riskFilter === r ? colors.textWhite : (r === "" ? colors.primary : getRiskColor(r)) }}>
                      {r === "" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl shadow-md overflow-hidden" style={{ backgroundColor: colors.surface }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: `${colors.primary}10` }}>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Business</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Sector</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Balance</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Income</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Risk</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Tx</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: colors.borderLight }}>
                    {filteredSmeList.map((sme) => (
                      <tr key={sme.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-mono" style={{ color: colors.textSecondary }}>{sme.id.toString().padStart(3, "0")}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div><div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{sme.business_name}</div>
                          <div className="text-xs" style={{ color: colors.textSecondary }}>{sme.owner_name}</div></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className="px-3 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: `${colors.primary}10`, color: colors.primary }}>{sme.sector}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right"><span className="text-sm font-semibold" style={{ color: sme.balance < 0 ? colors.error : colors.textPrimary }}>K {sme.balance.toLocaleString()}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right"><span className="text-sm" style={{ color: colors.success }}>K {sme.total_income.toLocaleString()}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-center"><span className="px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: `${getRiskColor(sme.risk_level)}20`, color: getRiskColor(sme.risk_level) }}>{sme.risk_level}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-center"><span className="text-sm font-medium" style={{ color: colors.textSecondary }}>{sme.transaction_count}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button onClick={() => fetchSmeDetail(sme.id)} className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:opacity-80" style={{ backgroundColor: `${colors.primary}10`, color: colors.primary }}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredSmeList.length === 0 && <div className="py-12 text-center"><p className="text-4xl mb-3">🏢</p><p className="text-sm" style={{ color: colors.textSecondary }}>No SMEs match your filters</p></div>}
              </div>
            </>
          )}

          {/* ========== LOANS TAB ========== */}
          {activeTab === "loans" && (
            <>
              {loanStats && (
                <div className="grid grid-cols-5 gap-4 mb-6">
                  <StatsCard title="Total Loans" value={loanStats.total.toString()} icon="📋" />
                  <StatsCard title="Pending" value={loanStats.pending.toString()} icon="⏳" />
                  <StatsCard title="Approved" value={loanStats.approved.toString()} icon="✅" />
                  <StatsCard title="Rejected" value={loanStats.rejected.toString()} icon="❌" />
                  <StatsCard title="Approved Amount" value={`K ${loanStats.total_approved_amount.toLocaleString()}`} icon="💰" />
                </div>
              )}

              <div className="flex gap-3 mb-4 items-center">
                <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Loan Applications</h3>
                <div className="flex gap-2 ml-auto">
                  {["", "pending", "approved", "rejected"].map((s) => (
                    <button key={s} onClick={() => setLoanStatusFilter(s)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                      style={{ backgroundColor: loanStatusFilter === s ? (s === "" ? colors.primary : getStatusColor(s)) : `${colors.primary}10`, color: loanStatusFilter === s ? colors.textWhite : (s === "" ? colors.primary : getStatusColor(s)) }}>
                      {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl shadow-md overflow-hidden" style={{ backgroundColor: colors.surface }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: `${colors.primary}10` }}>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Business</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Purpose</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Amount</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Duration</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Status</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: colors.borderLight }}>
                    {filteredLoans.map((loan) => (
                      <tr key={loan.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-mono" style={{ color: colors.textSecondary }}>{loan.id.toString().padStart(3, "0")}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div><div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{loan.business_name}</div>
                          <div className="text-xs" style={{ color: colors.textSecondary }}>{loan.owner_name} · {loan.sector}</div></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div><div className="text-sm font-medium" style={{ color: colors.textPrimary }}>{loan.purpose}</div>
                          {loan.description && <div className="text-xs truncate max-w-xs" style={{ color: colors.textLight }}>{loan.description}</div>}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right"><span className="text-sm font-bold" style={{ color: colors.textPrimary }}>K {loan.amount.toLocaleString()}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-center"><span className="text-sm" style={{ color: colors.textSecondary }}>{loan.duration_months} mo</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: `${getStatusColor(loan.status)}20`, color: getStatusColor(loan.status) }}>{loan.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {loan.status === "pending" ? (
                            <button onClick={() => setReviewingLoan(loan)} className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:opacity-80" style={{ backgroundColor: colors.primary, color: colors.textWhite }}>Review</button>
                          ) : (
                            <button onClick={() => setReviewingLoan(loan)} className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:opacity-80" style={{ backgroundColor: `${colors.primary}10`, color: colors.primary }}>View</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLoans.length === 0 && <div className="py-12 text-center"><p className="text-4xl mb-3">📋</p><p className="text-sm" style={{ color: colors.textSecondary }}>No loan applications</p></div>}
              </div>
            </>
          )}
        </main>
      </div>

      {/* SME Detail Modal */}
      {(selectedSme || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedSme(null)} />
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl" style={{ backgroundColor: colors.surface }}>
            {detailLoading ? (
              <div className="p-12 text-center"><div className="text-4xl animate-pulse mb-4">🏦</div><p style={{ color: colors.textSecondary }}>Loading...</p></div>
            ) : selectedSme && (
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>{selectedSme.sme.business_name}</h2>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>{selectedSme.sme.owner_name} · {selectedSme.sme.sector}</p>
                    <p className="text-xs mt-1" style={{ color: colors.textLight }}>{selectedSme.sme.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: `${getRiskColor(selectedSme.sme.risk_level)}20`, color: getRiskColor(selectedSme.sme.risk_level) }}>{selectedSme.sme.risk_level} risk</span>
                    <button onClick={() => setSelectedSme(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100" style={{ color: colors.textSecondary }}>✕</button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-4 rounded-xl" style={{ backgroundColor: `${colors.success}10` }}>
                    <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>Total Income</p>
                    <p className="text-lg font-bold" style={{ color: colors.success }}>K {selectedSme.sme.total_income.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: `${colors.error}10` }}>
                    <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>Total Expense</p>
                    <p className="text-lg font-bold" style={{ color: colors.error }}>K {selectedSme.sme.total_expenses.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ backgroundColor: `${colors.primary}10` }}>
                    <p className="text-xs font-medium" style={{ color: colors.textSecondary }}>Balance</p>
                    <p className="text-lg font-bold" style={{ color: selectedSme.sme.balance < 0 ? colors.error : colors.primary }}>K {selectedSme.sme.balance.toLocaleString()}</p>
                  </div>
                </div>
                <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: colors.background }}>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: colors.textPrimary }}>Monthly Cash Flow</h4>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={selectedSme.monthly} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis dataKey="month" tick={{ fill: colors.textSecondary, fontSize: 10 }} axisLine={{ stroke: colors.border }} />
                      <YAxis tick={{ fill: colors.textSecondary, fontSize: 10 }} axisLine={{ stroke: colors.border }} />
                      <Tooltip contentStyle={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 8 }} />
                      <Bar dataKey="income" fill={colors.success} radius={[3, 3, 0, 0]} name="Income" />
                      <Bar dataKey="expense" fill={colors.error} radius={[3, 3, 0, 0]} name="Expense" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3" style={{ color: colors.textPrimary }}>Recent Transactions</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedSme.transactions.slice(0, 10).map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: colors.background }}>
                        <div>
                          <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>{t.category}</span>
                          {t.description && <span className="text-xs ml-2" style={{ color: colors.textLight }}>· {t.description}</span>}
                          <div className="text-xs" style={{ color: colors.textLight }}>{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                        </div>
                        <span className="text-sm font-semibold" style={{ color: t.type === "income" ? colors.success : colors.error }}>{t.type === "income" ? "+" : "-"} K {t.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loan Review Modal */}
      {reviewingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setReviewingLoan(null); setReviewNotes(""); }} />
          <div className="relative w-full max-w-lg rounded-2xl shadow-2xl p-6" style={{ backgroundColor: colors.surface }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>Loan Application</h2>
              <button onClick={() => { setReviewingLoan(null); setReviewNotes(""); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100" style={{ color: colors.textSecondary }}>✕</button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm"><span style={{ color: colors.textSecondary }}>Business</span><span className="font-semibold" style={{ color: colors.textPrimary }}>{reviewingLoan.business_name}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: colors.textSecondary }}>Owner</span><span style={{ color: colors.textPrimary }}>{reviewingLoan.owner_name}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: colors.textSecondary }}>Sector</span><span style={{ color: colors.textPrimary }}>{reviewingLoan.sector}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: colors.textSecondary }}>Amount</span><span className="font-bold" style={{ color: colors.primary }}>K {reviewingLoan.amount.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: colors.textSecondary }}>Duration</span><span style={{ color: colors.textPrimary }}>{reviewingLoan.duration_months} months</span></div>
              <div className="flex justify-between text-sm"><span style={{ color: colors.textSecondary }}>Purpose</span><span className="font-medium" style={{ color: colors.textPrimary }}>{reviewingLoan.purpose}</span></div>
              {reviewingLoan.description && <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: colors.background, color: colors.textPrimary }}>{reviewingLoan.description}</div>}
              <div className="flex justify-between text-sm"><span style={{ color: colors.textSecondary }}>Status</span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{ backgroundColor: `${getStatusColor(reviewingLoan.status)}20`, color: getStatusColor(reviewingLoan.status) }}>{reviewingLoan.status}</span>
              </div>
              {reviewingLoan.admin_notes && <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: `${colors.primary}10`, color: colors.textPrimary }}><strong>Admin Notes:</strong> {reviewingLoan.admin_notes}</div>}
            </div>

            {reviewingLoan.status === "pending" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>Admin Notes</label>
                  <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} rows={3} placeholder="Add review notes..."
                    className="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2" style={{ borderColor: colors.border, color: colors.textPrimary }} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleReviewLoan(reviewingLoan.id, "rejected")} disabled={reviewLoading}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: colors.error, color: colors.textWhite }}>
                    {reviewLoading ? "Processing..." : "❌ Reject"}
                  </button>
                  <button onClick={() => handleReviewLoan(reviewingLoan.id, "approved")} disabled={reviewLoading}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: colors.success, color: colors.textWhite }}>
                    {reviewLoading ? "Processing..." : "✅ Approve"}
                  </button>
                </div>
              </>
            )}

            {reviewingLoan.status !== "pending" && (
              <button onClick={() => { setReviewingLoan(null); setReviewNotes(""); }}
                className="w-full py-2.5 rounded-lg text-sm font-semibold border transition-all hover:bg-gray-50"
                style={{ borderColor: colors.border, color: colors.textSecondary }}>Close</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
