"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import api from "@/lib/api";
import { colors } from "@/lib/colors";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(userData));
    setLoading(false);
  }, []);

  if (loading || !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 animate-pulse"
            style={{ backgroundColor: colors.primary }}
          >
            👤
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
            <h1 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
              My Profile
            </h1>
            <p style={{ color: colors.textSecondary }}>Manage your account</p>
          </div>

          <div className="max-w-2xl space-y-6">
            {/* Profile Header Card */}
            <div
              className="rounded-2xl p-6 shadow-lg"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="flex items-center gap-6">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    color: colors.textWhite,
                  }}
                >
                  {user.owner_name?.charAt(0) || "?"}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
                    {user.owner_name}
                  </h2>
                  <p className="text-lg mt-1" style={{ color: colors.textSecondary }}>
                    {user.business_name}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className="px-4 py-1 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: `${colors.primary}15`,
                        color: colors.primary,
                      }}
                    >
                      {user.sector}
                    </span>
                    <span
                      className="px-4 py-1 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: `${colors.success}15`,
                        color: colors.success,
                      }}
                    >
                      ● Active
                    </span>
                  </div>
                </div>
                <button
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{
                    backgroundColor: `${colors.primary}10`,
                    color: colors.primary,
                  }}
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className="rounded-xl p-5 shadow-md"
                style={{ backgroundColor: colors.surface }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${colors.success}15` }}
                  >
                    💰
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                      K 250,000
                    </p>
                    <p className="text-xs" style={{ color: colors.textLight }}>
                      Total Balance
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-xl p-5 shadow-md"
                style={{ backgroundColor: colors.surface }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${colors.success}15` }}
                  >
                    📈
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: colors.success }}>
                      K 150,000
                    </p>
                    <p className="text-xs" style={{ color: colors.textLight }}>
                      This Month Income
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-xl p-5 shadow-md"
                style={{ backgroundColor: colors.surface }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${colors.error}15` }}
                  >
                    📉
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: colors.error }}>
                      K 100,000
                    </p>
                    <p className="text-xs" style={{ color: colors.textLight }}>
                      This Month Expenses
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-xl p-5 shadow-md"
                style={{ backgroundColor: colors.surface }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${colors.accent}15` }}
                  >
                    📋
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                      19
                    </p>
                    <p className="text-xs" style={{ color: colors.textLight }}>
                      Total Transactions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div
              className="rounded-2xl p-6 shadow-lg"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                  Business Information
                </h3>
                <span
                  className="px-3 py-1 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: `${colors.primary}10`,
                    color: colors.primary,
                  }}
                >
                  Member Since Aug 2026
                </span>
              </div>
              <div className="space-y-0">
                {[
                  { icon: "🏢", label: "Business Name", value: user.business_name },
                  { icon: "👤", label: "Owner Name", value: user.owner_name },
                  { icon: "📱", label: "Phone Number", value: user.phone },
                  { icon: "🏭", label: "Sector", value: user.sector },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-4 px-4 rounded-xl transition-colors hover:bg-gray-50"
                    style={{
                      borderBottom: `1px solid ${colors.borderLight}`,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${colors.primary}10` }}
                      >
                        <span>{item.icon}</span>
                      </div>
                      <span style={{ color: colors.textSecondary }}>
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Account Settings */}
            <div
              className="rounded-2xl p-6 shadow-lg"
              style={{ backgroundColor: colors.surface }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
                Account Settings
              </h3>
              <div className="space-y-2">
                {[
                  { icon: "🔒", label: "Change Password", iconBg: `${colors.primary}10` },
                  { icon: "🌐", label: "Language", value: "Myanmar", iconBg: `${colors.accent}15` },
                  { icon: "🔔", label: "Notifications", value: "Enabled", iconBg: `${colors.success}15` },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-4 px-4 rounded-xl cursor-pointer transition-colors hover:bg-gray-50"
                    style={{
                      borderBottom: `1px solid ${colors.borderLight}`,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: item.iconBg }}
                      >
                        {item.icon}
                      </div>
                      <span style={{ color: colors.textPrimary }}>
                        {item.label}
                      </span>
                    </div>
                    {item.value ? (
                      <span
                        className="px-3 py-1 rounded-lg text-xs font-medium"
                        style={{
                          backgroundColor: `${colors.primary}10`,
                          color: colors.primary,
                        }}
                      >
                        {item.value}
                      </span>
                    ) : (
                      <span style={{ color: colors.textLight }}>→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/login");
              }}
              className="w-full py-4 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{
                backgroundColor: `${colors.error}10`,
                color: colors.error,
                borderWidth: 2,
                borderColor: colors.error,
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
