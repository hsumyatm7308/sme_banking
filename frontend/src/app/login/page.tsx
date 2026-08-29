"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { colors } from "@/lib/colors";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", phone);
      formData.append("password", password);

      const response = await api.post("/api/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      const role = response.data.user.role;
      router.push(role === "bank_admin" ? "/bank" : "/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full" style={{ backgroundColor: colors.primary }}></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full" style={{ backgroundColor: colors.accent }}></div>
        </div>

        <div className="text-center relative z-10 px-8">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-2xl"
            style={{ backgroundColor: colors.primary }}
          >
            🏦
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{ color: colors.textWhite }}>
            SME Banking
          </h1>
          <p className="text-xl" style={{ color: colors.textWhite }}>
            AI-Powered Business Growth
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <div
              className="px-4 py-2 rounded-full text-sm"
              style={{ backgroundColor: `${colors.primary}30`, color: colors.textWhite }}
            >
              Smart Analytics
            </div>
            <div
              className="px-4 py-2 rounded-full text-sm"
              style={{ backgroundColor: `${colors.accent}30`, color: colors.textWhite }}
            >
              Financial Insights
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ backgroundColor: colors.background }}>
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
              style={{ backgroundColor: colors.primary }}
            >
              🏦
            </div>
            <h1 className="text-2xl font-bold" style={{ color: colors.primary }}>
              SME Banking
            </h1>
          </div>

          <div
            className="rounded-2xl p-8 shadow-xl"
            style={{ backgroundColor: colors.surface }}
          >
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>
              Welcome Back
            </h2>
            <p className="mb-6" style={{ color: colors.textSecondary }}>
              Sign in to your account
            </p>

            {error && (
              <div
                className="p-3 rounded-lg mb-4 text-sm"
                style={{ backgroundColor: `${colors.error}10`, color: colors.error }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: colors.primary }}
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                  placeholder="09-xxxxxxxxx"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: colors.primary }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                  onBlur={(e) => (e.target.style.borderColor = colors.border)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.textWhite,
                }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-center" style={{ color: colors.textSecondary }}>
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold hover:underline"
                style={{ color: colors.primary }}
              >
                Register
              </Link>
            </p>
          </div>

          <div
            className="mt-6 p-4 rounded-lg"
            style={{ backgroundColor: `${colors.primary}10` }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: colors.primary }}>
              Demo Accounts:
            </p>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              SME: <span className="font-mono">09123456789</span> / <span className="font-mono">password123</span>
            </p>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Admin: <span className="font-mono">09987654321</span> / <span className="font-mono">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
