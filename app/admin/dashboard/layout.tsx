"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Rocket,
  Users,
  ChevronRight,
  LogOut,
  Coins,
  HandCoins,
} from "lucide-react";
import { ethers } from "ethers";
import { BACKEND_URL } from "../../lib/config";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [admin, setAdmin] = useState<{ name: string; wallet: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "ICO Stages", href: "/admin/dashboard/ico", icon: Rocket },
    { name: "Manage Users", href: "/admin/dashboard/UserList", icon: Users },
    { name: "Staking", href: "/admin/dashboard/staking", icon: Coins },
    { name: "My Earning", href: "/admin/dashboard/myincom", icon: Coins },
    { name: "Token Send", href: "/admin/dashboard/token", icon: HandCoins },
  ];

  useEffect(() => {
    async function initAdmin() {
      if (!window.ethereum) {
        router.replace("/");
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);

        if (!accounts || accounts.length === 0) {
          router.replace("/");
          return;
        }

        const address = accounts[0].toLowerCase();

        const res = await fetch(`${BACKEND_URL}/user/${address}`);
        if (!res.ok) {
          router.replace("/");
          return;
        }

        const data = await res.json();

        if (data.role !== "ADMIN") {
          router.replace("/dashboard");
          return;
        }

        setAdmin({ name: data.name, wallet: data.wallet });
      } catch (err) {
        console.error("Admin auth failed:", err);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    }

    initAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-slate-400">
        Verifying admin wallet...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-[#0F172A] text-slate-300 flex flex-col shadow-xl">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            A
          </div>
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 mt-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
            Main Menu
          </p>

          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-lg transition-all
                  ${active
                    ? "bg-blue-600 text-white shadow"
                    : "hover:bg-slate-800 hover:text-white"}
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    size={20}
                    className={active ? "text-white" : "text-slate-400"}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                {active && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={() => router.replace("/")}
          className="flex items-center gap-3 w-full px-6 py-4 text-slate-400 hover:text-red-400 text-sm font-medium border-t border-slate-800"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-slate-800 font-semibold text-lg capitalize">
            {pathname.split("/").pop()?.replace("-", " ")}
          </h1>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900">{admin?.name}</p>
              <p className="text-[10px] text-slate-500">Super Admin</p>
            </div>
            <div className="w-9 h-9 bg-slate-200 rounded-full border border-slate-300" />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
