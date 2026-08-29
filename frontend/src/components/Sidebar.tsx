"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { colors } from "@/lib/colors";

const menuItems = [
  { name: "Dashboard", path: "/", icon: "🏠" },
  { name: "Transactions", path: "/transactions", icon: "📋" },
  { name: "Profile", path: "/profile", icon: "👤" },
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 min-h-screen p-4"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="mb-8 pt-4">
        <h1 className="text-xl font-bold flex items-center gap-3">
          <span
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: colors.secondary }}
          >
            🏦
          </span>
          <span style={{ color: colors.textWhite }}>SME Banking</span>
        </h1>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
            style={{
              backgroundColor:
                pathname === item.path ? colors.secondary : "transparent",
              color: colors.textWhite,
            }}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}

        {role === "bank_admin" && (
          <Link
            href="/bank"
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
            style={{
              backgroundColor:
                pathname === "/bank" ? colors.secondary : "transparent",
              color: colors.textWhite,
            }}
          >
            <span className="text-lg">🏦</span>
            <span className="font-medium">Bank Admin</span>
          </Link>
        )}
      </nav>
    </aside>
  );
}
