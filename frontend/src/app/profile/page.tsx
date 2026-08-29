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

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role === "bank_admin") {
      router.push("/bank");
      return;
    }

    setUser(parsedUser);
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
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse"
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
            <h1
              className="text-2xl font-bold"
              style={{ color: colors.textPrimary }}
            >
              My Profile
            </h1>
          </div>

          <div className="max-w-2xl space-y-6">
            {/* Profile Header */}
            <div
              className="rounded-xl p-6 shadow-md"
              style={{ backgroundColor: colors.surface }}
            >
              <div className="flex items-center gap-6">
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary} 100%)`,
                    color: colors.textWhite,
                  }}
                >
                  {user.owner_name?.charAt(0) || "?"}
                </div>
                <div>
                  <h2
                    className="text-xl font-bold"
                    style={{ color: colors.textPrimary }}
                  >
                    {user.owner_name}
                  </h2>
                  <p style={{ color: colors.textSecondary }}>
                    {user.business_name}
                  </p>
                  <p
                    className="text-sm mt-1"
                    style={{ color: colors.textLight }}
                  >
                    {user.sector}
                  </p>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div
              className="rounded-xl p-6 shadow-md"
              style={{ backgroundColor: colors.surface }}
            >
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: colors.textPrimary }}
              >
                Business Information
              </h3>
              <div className="space-y-4">
                <div
                  className="flex justify-between py-3"
                  style={{ borderBottom: `1px solid ${colors.borderLight}` }}
                >
                  <span style={{ color: colors.textSecondary }}>
                    Business Name
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    {user.business_name}
                  </span>
                </div>
                <div
                  className="flex justify-between py-3"
                  style={{ borderBottom: `1px solid ${colors.borderLight}` }}
                >
                  <span style={{ color: colors.textSecondary }}>
                    Owner Name
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    {user.owner_name}
                  </span>
                </div>
                <div
                  className="flex justify-between py-3"
                  style={{ borderBottom: `1px solid ${colors.borderLight}` }}
                >
                  <span style={{ color: colors.textSecondary }}>Phone</span>
                  <span
                    className="font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    {user.phone}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span style={{ color: colors.textSecondary }}>Sector</span>
                  <span
                    className="font-medium"
                    style={{ color: colors.textPrimary }}
                  >
                    {user.sector}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div
              className="rounded-xl p-6 shadow-md"
              style={{ backgroundColor: colors.surface }}
            >
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: colors.textPrimary }}
              >
                Account Settings
              </h3>
              <div className="space-y-2">
                <div
                  className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 px-4 rounded-lg transition-colors"
                  style={{ borderBottom: `1px solid ${colors.borderLight}` }}
                >
                  <span style={{ color: colors.textPrimary }}>
                    Change Password
                  </span>
                  <span style={{ color: colors.textLight }}>→</span>
                </div>
                <div className="flex items-center justify-between py-4 px-4 rounded-lg">
                  <span style={{ color: colors.textPrimary }}>Language</span>
                  <span
                    className="px-3 py-1 rounded-lg text-sm"
                    style={{
                      backgroundColor: `${colors.primary}10`,
                      color: colors.primary,
                    }}
                  >
                    Myanmar ▼
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
