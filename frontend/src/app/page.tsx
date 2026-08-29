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
  id: number;
  business_name: string;
  owner_name: string;
  role: string;
}

interface DashboardData {
  summary: {
    total_balance: number;
    monthly_income: number;
    monthly_expenses: number;
  };
  monthly: {
    months: string[];
    income: number[];
    expenses: number[];
  };
  recentTransactions: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role === "bank_admin") {
      router.push("/bank");
      return;
    }

    setUser(parsedUser);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summary, monthly, transactions] = await Promise.all([
        api.get("/api/dashboard/summary"),
        api.get("/api/dashboard/monthly-summary"),
        api.get("/api/transactions"),
      ]);

      setData({
        summary: summary.data,
        monthly: monthly.data,
        recentTransactions: transactions.data.slice(0, 5),
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user || !data) {
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
            🏦
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
          {/* Welcome Section */}
          <div
            className="rounded-xl p-6 mb-6"
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
            }}
          >
            <h1 className="text-2xl font-bold" style={{ color: colors.textWhite }}>
              Welcome back, {user.owner_name}! 👋
            </h1>
            <p className="mt-1" style={{ color: colors.textWhite }}>
              {user.business_name} • Here&apos;s your financial overview
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatsCard
              title="Total Balance"
              value={`K ${data.summary.total_balance.toLocaleString()}`}
              icon="💰"
            />
            <StatsCard
              title="Monthly Income"
              value={`K ${data.summary.monthly_income.toLocaleString()}`}
              subtitle="This month"
              icon="📈"
              trend="up"
              trendValue="+12%"
            />
            <StatsCard
              title="Monthly Expenses"
              value={`K ${data.summary.monthly_expenses.toLocaleString()}`}
              subtitle="This month"
              icon="📉"
            />
          </div>

          {/* Chart */}
          <div className="mb-6">
            <Chart data={data.monthly} />
          </div>

          {/* Recent Transactions */}
          <div>
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: colors.textPrimary }}
            >
              Recent Transactions
            </h2>
            <TransactionTable transactions={data.recentTransactions} />
          </div>
        </main>
      </div>
    </div>
  );
}
