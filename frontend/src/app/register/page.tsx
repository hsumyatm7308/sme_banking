"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { colors } from "@/lib/colors";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    business_name: "",
    owner_name: "",
    sector: "Retail",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/api/auth/register", formData);
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const sectors = [
    "Retail",
    "Food",
    "Services",
    "Manufacturing",
    "Technology",
    "Other",
  ];

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
            Start Your Journey Today
          </p>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ backgroundColor: colors.background }}>
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>
            Create Account
          </h2>
          <p className="mb-6" style={{ color: colors.textSecondary }}>
            Join SME Banking today
          </p>

          {error && (
            <div
              className="p-3 rounded-lg mb-4 text-sm"
              style={{ backgroundColor: `${colors.error}10`, color: colors.error }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: colors.primary }}
              >
                Business Name
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) =>
                  setFormData({ ...formData, business_name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                }}
                onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                onBlur={(e) => (e.target.style.borderColor = colors.border)}
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: colors.primary }}
              >
                Owner Name
              </label>
              <input
                type="text"
                value={formData.owner_name}
                onChange={(e) =>
                  setFormData({ ...formData, owner_name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                }}
                onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                onBlur={(e) => (e.target.style.borderColor = colors.border)}
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: colors.primary }}
              >
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
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
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                }}
                onFocus={(e) => (e.target.style.borderColor = colors.primary)}
                onBlur={(e) => (e.target.style.borderColor = colors.border)}
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: colors.primary }}
              >
                Sector
              </label>
              <div className="flex flex-wrap gap-2">
                {sectors.map((sector) => (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => setFormData({ ...formData, sector })}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
backgroundColor:
                          formData.sector === sector
                            ? colors.primary
                            : `${colors.primary}10`,
                      color:
                        formData.sector === sector
                          ? colors.textWhite
                          : colors.primary,
                    }}
                  >
                    {sector}
                  </button>
                ))}
              </div>
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
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center" style={{ color: colors.textSecondary }}>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold hover:underline"
              style={{ color: colors.primary }}
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
