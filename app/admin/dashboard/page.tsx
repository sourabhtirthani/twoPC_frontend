"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { 
  Users, 
  Rocket, 
  Coins, 
  Activity, 
  ArrowUpRight, 
  Wallet, 
  RefreshCcw,
  ShieldCheck,
  Globe
} from "lucide-react";
import { BACKEND_URL } from "@/app/lib/config";

export default function AdminDashboard() {
  const router = useRouter();
  
  // Hydration & Loading States
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
    const [totalUsers, setTotalUsers] = useState(0);
  const [activeIcoStages, setActiveIcoStages] = useState(0);
  const [totalStaked, setTotalStaked] = useState("0");

  // Data States
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeIcoStages: 0,
    totalStaked: "0",
    liveTransactions: [] as any[]
  });

  useEffect(() => {
    setMounted(true);

    async function initializeDashboard() {
      // 1. Basic environment check
      if (typeof window === "undefined" || !window.ethereum) {
        router.push("/");
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        
        if (accounts.length === 0) {
          router.push("/");
          return;
        }

        const wallet = accounts[0];

        // 2. Security Check: Authenticate Admin Role
        const authRes = await fetch(`${BACKEND_URL}/user/wallet-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet }),
        });

        const authData = await authRes.json();
        
        if (!authData.exists || authData.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }

        // 3. Fetch Analytics Data
        const statsRes = await fetch(`${BACKEND_URL}/admin/dashboard-stats`);
        const data = await statsRes.json();
        console.log("Fetched dashboard stats", data.users, data.activeStakingPlans, data.activeIcos);
        setTotalUsers(data.users);
        setTotalStaked(data.activeStakingPlans);
        setActiveIcoStages(data.activeIcos);

      } catch (err) {
        console.error("Dashboard Load Failed:", err);
      } finally {
        setLoading(false);
      }
    }

    initializeDashboard();
  }, [router]);
  // Prevent Hydration Mismatch
  if (!mounted) return null;

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <RefreshCcw className="animate-spin text-blue-600" size={40} />
      <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Securing Session...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 text-white">
                <ShieldCheck size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Command Center</h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Real-time Protocol Monitor
                </p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95">
                Export Logs
            </button>
            <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
                <RefreshCcw size={16} /> Sync Data
            </button>
        </div>
      </div>

      {/* STATS ANALYTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Registered" 
          value={totalUsers.toLocaleString()} 
          icon={<Users size={24}/>} 
          trend="Unique Wallets"
          color="blue"
        />
        <StatCard 
          title="Active Stages" 
          value={activeIcoStages.toString()} 
          icon={<Rocket size={24}/>} 
          trend="Live ICO Phases"
          color="purple"
        />
        <StatCard 
          title="Liquidity Staked" 
          value={`${totalStaked}`} 
          icon={<Coins size={24}/>} 
          trend="Total 2PC Tokens"
          color="emerald"
        />
        <StatCard 
          title="System Load" 
          value="Optimal" 
          icon={<Activity size={24}/>} 
          trend="Node Latency: 24ms"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LIVE TRANSACTIONS TABLE */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div>
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Global Activity Feed</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1">LATEST SMART CONTRACT INTERACTIONS</p>
            </div>
            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100 animate-pulse">
                LIVE STREAM
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                  <th className="px-8 py-5">Transaction Hash</th>
                  <th className="px-8 py-4">Protocol</th>
                  <th className="px-8 py-4">Volume</th>
                  <th className="px-8 py-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.liveTransactions.length === 0 ? (
                    <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-medium italic">No recent blockchain transactions found...</td></tr>
                ) : (
                    stats.liveTransactions.map((tx, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors cursor-pointer group">
                        <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-slate-800 text-sm font-mono">#{tx.hash.slice(0, 14)}...</span>
                                <span className="text-[10px] text-slate-400 font-medium italic">From: {tx.from.slice(0, 10)}...</span>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <span className="px-3 py-1 rounded-lg bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider">
                                {tx.method || "STAKE"}
                            </span>
                        </td>
                        <td className="px-8 py-6">
                            <p className="font-black text-slate-900 text-sm">{tx.amount} <span className="text-slate-400 text-[10px]">2PC</span></p>
                        </td>
                        <td className="px-8 py-6 text-right">
                            <span className="text-emerald-500 font-black text-[10px] flex items-center justify-end gap-1 uppercase tracking-tighter">
                                Confirmed <ArrowUpRight size={14}/>
                            </span>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDEBAR: INFRASTRUCTURE & WALLET */}
        <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-300 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 opacity-10 text-white">
                    <Globe size={150} />
                </div>
                
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    Infrastructure <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                </h3>
                
                <div className="space-y-5 relative z-10">
                    <HealthBar label="Mainnet RPC" status="12ms" color="bg-emerald-400" />
                    <HealthBar label="Staking Engine" status="Healthy" color="bg-emerald-400" />
                    <HealthBar label="ICO Database" status="Synced" color="bg-emerald-400" />
                    <HealthBar label="Auth Service" status="Secure" color="bg-blue-400" />
                </div>

                <div className="mt-10 pt-8 border-t border-slate-800 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-emerald-400">
                            <Wallet size={24}/>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Contract Reserves</p>
                            <p className="text-2xl font-black tracking-tight">850,240 <span className="text-xs text-slate-500">2PC</span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200">
                <h3 className="text-lg font-black mb-2 tracking-tight">Security Protocol</h3>
                <p className="text-blue-100 text-xs font-medium leading-relaxed mb-6">
                    All administrative actions are logged via backend audit trails. Multi-sig validation is recommended for large withdrawals.
                </p>
                <button className="w-full py-4 bg-white text-blue-700 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-50 transition-all active:scale-95">
                    View Audit Logs
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

function StatCard({ title, value, icon, trend, color }: any) {
    const colors: any = {
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        emerald: "bg-emerald-50 text-emerald-600",
        orange: "bg-orange-50 text-orange-600"
    };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-blue-500 transition-all cursor-default">
      <div className="flex items-start justify-between mb-6">
        <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div className="text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{trend}</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-black text-slate-400 mb-1 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function HealthBar({ label, status, color }: any) {
    return (
        <div className="flex items-center justify-between group">
            <span className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">{label}</span>
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-tighter text-slate-300">{status}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${color} shadow-[0_0_8px_rgba(0,0,0,0.5)] shadow-current`} />
            </div>
        </div>
    )
}