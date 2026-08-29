"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import api from "@/lib/api";
import { colors } from "@/lib/colors";

interface SMESummary {
  id: number;
  business_name: string;
  owner_name: string;
  sector: string;
  balance: number;
  risk_level: string;
  transaction_count: number;
}

export default function BankPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [smeList, setSmeList] = useState<SMESummary[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.role !== "bank_admin") {
      router.push("/");
      return;
    }

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

  if (loading || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse"
            style={{ backgroundColor: colors.accent }}
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
          <div className="mb-6">
            <h1
              className="text-2xl font-bold"
              style={{ color: colors.textPrimary }}
            >
              Bank Dashboard
            </h1>
            <p style={{ color: colors.textSecondary }}>
              SME Monitoring & Analytics
            </p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <StatsCard
                title="Total SMEs"
                value={stats.total_smes.toString()}
                icon="🏢"
              />
              <StatsCard
                title="Active SMEs"
                value={stats.active_smes.toString()}
                icon="✅"
              />
              <StatsCard
                title="High Risk"
                value={stats.high_risk_smes.toString()}
                icon="⚠️"
              />
              <StatsCard
                title="Total Volume"
                value={`K ${stats.total_volume.toLocaleString()}`}
                icon="💹"
              />
            </div>
          )}

          {/* SME List */}
          <div
            className="rounded-xl shadow-md overflow-hidden"
            style={{ backgroundColor: colors.surface }}
          >
            <div className="p-4" style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
              <input
                type="text"
                placeholder="Search SMEs..."
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                }}
                onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                onBlur={(e) => (e.target.style.borderColor = colors.border)}
              />
            </div>

            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: `${colors.primary}10` }}>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.primary }}
                  >
                    ID
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.primary }}
                  >
                    Business
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.primary }}
                  >
                    Sector
                  </th>
                  <th
                    className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.primary }}
                  >
                    Balance
                  </th>
                  <th
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.primary }}
                  >
                    Risk
                  </th>
                  <th
                    className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.primary }}
                  >
                    Transactions
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: colors.borderLight }}
              >
                {smeList.map((sme) => (
                  <tr
                    key={sme.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="text-sm font-mono"
                        style={{ color: colors.textSecondary }}
                      >
                        {sme.id.toString().padStart(3, "0")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: colors.textPrimary }}
                        >
                          {sme.business_name}
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: colors.textSecondary }}
                        >
                          {sme.owner_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-3 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: `${colors.primary}10`,
                          color: colors.primary,
                        }}
                      >
                        {sme.sector}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: colors.textPrimary }}
                      >
                        K {sme.balance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className="px-3 py-1 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: `${getRiskColor(sme.risk_level)}20`,
                          color: getRiskColor(sme.risk_level),
                        }}
                      >
                        {sme.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className="text-sm font-medium"
                        style={{ color: colors.textSecondary }}
                      >
                        {sme.transaction_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
