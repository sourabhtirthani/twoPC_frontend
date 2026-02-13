"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  ListTodo,
  FileText,
  ChevronRight,
  Network,
  Coins,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { ethers } from "ethers";
import { BACKEND_URL } from "../lib/config";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<{ name: string; wallet: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "All stages", href: "/dashboard/ico", icon: ListTodo },
    { name: "Staking", href: "/dashboard/staking", icon: Coins },
    { name: "My Staking", href: "/dashboard/mystaking", icon: Coins },
    { name: "My Income", href: "/dashboard/myincom", icon: Coins },
    { name: "Referral Tree", href: "/dashboard/referrals", icon: Network },
    { name: "All logs", href: "/dashboard/transactions", icon: FileText, hasSub: true },
  ];

  useEffect(() => {
    async function initUser() {
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
        if (!data) {
          router.replace("/");
          return;
        }

        setUser({
          name: data.name,
          wallet: data.wallet,
        });
      } catch (err) {
        console.error("Auth failed:", err);
        router.replace("/");
      } finally {
        setLoadingUser(false);
      }
    }

    initUser();
  }, [router]);

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-400">
        Checking wallet authorization...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#050B24] border-b border-slate-800 flex items-center justify-between px-4 z-50">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="text-blue-500">2PC</span> User
        </h2>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#050B24] border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo (Hidden on mobile since we have a header) */}
        <div className="p-6 hidden md:block">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-blue-500">2PC</span> User
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-16 md:mt-0">
          <p className="text-slate-500 text-[11px] uppercase font-bold tracking-widest px-4 mb-4 pt-4 md:pt-0">
            General
          </p>

          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3.5 rounded-lg transition-all group ${isActive
                  ? "bg-[#0B122B] text-blue-400"
                  : "text-slate-300 hover:bg-[#0B122B] hover:text-white"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon
                    size={20}
                    className={
                      isActive
                        ? "text-blue-400"
                        : "text-slate-400 group-hover:text-blue-400"
                    }
                  />
                  <span className="text-sm font-semibold tracking-wide">
                    {item.name}
                  </span>
                </div>
                {item.hasSub && <ChevronRight size={16} className="text-slate-500" />}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-[#0B122B] rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs uppercase">
              {user?.name?.[0] || "U"}
            </div>
            <div className="flex-1 overflow-hidden text-xs">
              <p className="font-bold truncate">{user?.name}</p>
              <p className="text-slate-500 truncate font-mono">
                {user?.wallet.slice(0, 6)}...{user?.wallet.slice(-4)}
              </p>
            </div>
          </div>
        </div>
        {/* Logout */}
        <button
          onClick={() => router.replace("/")}
          className="flex items-center gap-3 w-full px-6 py-4 text-slate-400 hover:text-red-400 text-sm font-medium border-t border-slate-800"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* --- OVERLAY --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-[#050B24] flex items-center justify-end px-8 md:flex">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Mainnet Active
            </span>
          </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 w-full overflow-y-auto overflow-x-hidden bg-[#020617] p-4 md:p-8">
          {children}
        </section>
      </main>
    </div>
  );
}
