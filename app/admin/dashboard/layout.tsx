"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Rocket, 
  Users, 
  Settings, 
  ChevronRight,
  LogOut, 
  Coins
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Helper to check if a link is active
  const isActive = (path: string) => pathname === path;

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "ICO Stages", href: "/admin/dashboard/ico", icon: Rocket },
    { name: "Manage Users", href: "/admin/dashboard/UserList", icon: Users },
    { name: "Staking", href: "/admin/dashboard/staking", icon:  Coins },
  ];

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      {/* --- SIDEBAR --- */}
      <aside className="w-72 bg-[#0F172A] text-slate-300 flex flex-col shadow-xl">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Admin Panel</h2>
          </div>
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
                  flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group
                  ${active 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : "hover:bg-slate-800 hover:text-white"}
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={active ? "text-white" : "text-slate-400 group-hover:text-blue-400"} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                {active && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        {/* Footer / User Section */}
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 w-full px-3 py-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
           <h1 className="text-slate-800 font-semibold text-lg capitalize">
              {pathname.split("/").pop()?.replace("-", " ")}
           </h1>
           <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">Admin User</p>
                <p className="text-[10px] text-slate-500">Super Admin</p>
              </div>
              <div className="w-9 h-9 bg-slate-200 rounded-full border border-slate-300"></div>
           </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}