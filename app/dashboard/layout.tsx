"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  ListTodo, 
  Gavel, 
  Wallet, 
  HandCoins, 
  FileText, 
  ChevronRight, 
  Network,
  Coins
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "All stages", href: "/dashboard/ico", icon: ListTodo },
    { name: "Staking", href: "/dashboard/staking", icon: Coins },
    { name: "My Staking", href: "/dashboard/mystaking", icon: Coins },
    { name: "Referral Tree", href: "/dashboard/referrals", icon: Network }, // Added this
    { name: "All logs", href: "/dashboard/transactions", icon: FileText, hasSub: true },
  ];

  return (
    <div className="flex min-h-screen bg-[#020617] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#050B24] border-r border-slate-800 flex flex-col">
        {/* Logo Section */}
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-blue-500">2PC</span> Admin
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          <p className="text-slate-500 text-[11px] uppercase font-bold tracking-widest px-4 mb-4">
            General
          </p>
          
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                  ? "bg-[#0B122B] text-blue-400" 
                  : "text-slate-300 hover:bg-[#0B122B] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Styled Icon with Gradients */}
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
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="flex-1 overflow-hidden text-xs">
              <p className="font-bold truncate">Admin User</p>
              <p className="text-slate-500 truncate">admin@2pccoin.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Placeholder */}
        <header className="h-16 border-b border-slate-800 bg-[#050B24] flex items-center justify-end px-8">
           <div className="flex items-center gap-4">
             <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mainnet Active</span>
           </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 overflow-y-auto bg-[#020617] p-8">
          {children}
        </section>
      </main>
    </div>
  );
}