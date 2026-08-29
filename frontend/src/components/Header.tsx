"use client";

import { useRouter } from "next/navigation";
import { colors } from "@/lib/colors";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <header
      className="px-6 py-4 flex justify-between items-center shadow-sm"
      style={{ backgroundColor: colors.surface }}
    >
      <div></div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
          style={{
            backgroundColor: colors.error,
            color: colors.textWhite,
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
