"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  Home, 
  ListTodo, 
  Gavel, 
  Wallet, 
  HandCoins, 
  FileText, 
  ChevronRight, 
  Network,
  Coins,
  Menu,
  X
} from "lucide-react";
import { useEffect } from "react";
import { BACKEND_URL } from "../lib/config";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "All stages", href: "/dashboard/ico", icon: ListTodo },
    { name: "Staking", href: "/dashboard/staking", icon: Coins },
    { name: "My Staking", href: "/dashboard/mystaking", icon: Coins },
    { name: "My Income", href: "/dashboard/myincom", icon: Coins },
    { name: "Referral Tree", href: "/dashboard/referrals", icon: Network }, 
    { name: "All logs", href: "/dashboard/transactions", icon: FileText, hasSub: true },
  ];
  const router = useRouter();

  const [wallet, setWallet] = useState<string>("");
  const [user, setUser] = useState<{ name: string; wallet: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchUserList = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/user/:userlist`);
      const data = await res.json();
      //setPlans(Array.isArray(data) ? data : []);
    } catch {
      //setPlans([]);
    }
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  useEffect(() => {
    async function initUser() {
      if (!window.ethereum) {
        router.replace("/");
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);

        // ❌ Not connected → kick out
        if (!accounts || accounts.length === 0) {
          router.replace("/");
          return;
        }

        const address = accounts[0].toLowerCase();
        setWallet(address);

        // ✅ Fetch user from backend
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
    <div className="flex min-h-screen bg-[#020617] text-white font-sans relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#050B24] border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-blue-500">2PC</span> User
          </h2>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="text-slate-500 text-[11px] uppercase font-bold tracking-widest px-4 mb-4">
            General
          </p>

          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                  ? "bg-[#0B122B] text-blue-400" 
                  : "text-slate-300 hover:bg-[#0B122B] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon 
                    size={20} 
                    className={`${
                      isActive 
                      ? "text-blue-400" 
                      : "text-slate-400 group-hover:text-blue-400"
                    } transition-colors`}
                  />
                  <span className="text-sm font-semibold tracking-wide">
                    {item.name}
                  </span>
                </div>
                {item.hasSub && (
                  <ChevronRight size={16} className="text-slate-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Optional User Section Footer */}
        <div className="p-4 border-t border-slate-800/50">
          <div className="bg-[#0B122B] rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs uppercase">
              {user?.name?.[0] || "U"}
            </div>
            <div className="flex-1 overflow-hidden text-xs">
              <p className="font-bold truncate">{user?.name}</p>
              <p className="text-slate-500 truncate font-mono">
                {user?.wallet?.slice(0, 6)}...{user?.wallet?.slice(-4)}
              </p>
            </div>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-[#050B24] flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
           {/* Mobile Menu Toggle */}
           <button 
             onClick={() => setIsSidebarOpen(true)}
             className="md:hidden text-slate-400 hover:text-white p-2 -ml-2"
             aria-label="Open menu"
           >
             <Menu size={24} />
           </button>

           {/* MobileSpacer / Desktop Push */}
           <div className="flex-1 md:hidden"></div>

           <div className="flex items-center gap-4">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mainnet Active</span>
           </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 overflow-y-auto bg-[#020617] p-4 md:p-8">
          {children}
        </section>
      </main>
    </div>
  );
}