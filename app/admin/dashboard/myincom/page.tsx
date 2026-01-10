"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Users, 
  Wallet, 
  ArrowDownLeft, 
  Filter,
  Layers,
  Calendar
} from "lucide-react";
import { ethers } from "ethers";
import { BACKEND_URL } from "@/app/lib/config";

interface EarningRecord {
  _id: string;
  fromWallet: string;
  fromName:string
  amount: string;
  level: number;
  timestamp: string;
  type: "ICO_PURCHASE" | "STAKING_REWARD";
}

export default function ReferralEarningsPage() {
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarned: "0",
    totalReferrals: 0,
    activeBonus: "0"
  });

  useEffect(() => {
    async function fetchEarnings() {
      if (!window.ethereum) return;
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length === 0) return;

        const wallet = accounts[0];

        // Fetch earnings list and summary stats
        const res = await fetch(`${BACKEND_URL}/user/referral-earnings?wallet=${wallet}`);
        const data = await res.json();

        setEarnings(data.records || []);
        setStats({
          totalEarned: data.totalEarned || "0",
          totalReferrals: data.referralCount || 0,
          activeBonus: data.currentPeriodBonus || "0"
        });
      } catch (err) {
        console.error("Failed to load earnings:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEarnings();
  }, []);
  useEffect(() => {
  async function fetchEarnings() {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);
      if (accounts.length === 0) return;

      const wallet = accounts[0];
        console.log("Fetching earnings for wallet:", wallet);
      const res = await fetch(
        `${BACKEND_URL}/transaction/transactions?wallet=${wallet}`
      );

      const txs = await res.json();
      console.log("Fetched earnings transactions:", txs);
      // 🔄 Map backend txs → UI earnings
      const mapped: EarningRecord[] = txs.contributors.map((tx: any) => ({
        _id: tx._id,
        fromWallet: tx.fromWallet,
        fromName: tx.fromName,
        amount: tx.totalAmount,
        timestamp: tx.createdAt,
      }));

      setEarnings(mapped);

      // 📊 Stats
      const total = mapped.reduce(
        (sum, r) => sum + Number(r.amount),
        0
      );

      setStats({
        totalEarned: total.toFixed(6),
        totalReferrals: new Set(mapped.map(r => r.fromWallet)).size,
        activeBonus: total.toFixed(6),
      });

    } catch (err) {
      console.error("Failed to load earnings:", err);
    } finally {
      setLoading(false);
    }
  }

  fetchEarnings();
}, []);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- HEADER & SUMMARY --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Referral Revenue</h1>
            <p className="text-slate-500 font-medium">Track your commission from your network activity.</p>
          </div>
          <div className="bg-blue-600 px-6 py-4 rounded-[2rem] text-white flex items-center gap-4 shadow-xl shadow-blue-200">
             <div className="bg-white/20 p-2 rounded-xl">
                <Wallet size={20} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Commission</p>
                <p className="text-xl font-black">{stats.totalEarned} 2PC</p>
             </div>
          </div>
        </div>

        {/* --- QUICK STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickStat 
                label="Direct Referrals" 
                value={stats.totalReferrals.toString()} 
                icon={<Users size={20}/>} 
                color="blue" 
            />
            <QuickStat 
                label="Network Depth" 
                value="3 Levels" 
                icon={<Layers size={20}/>} 
                color="purple" 
            />
            <QuickStat 
                label="This Month" 
                value={`${stats.activeBonus} 2PC`} 
                icon={<TrendingUp size={20}/>} 
                color="emerald" 
            />
        </div>

        {/* --- EARNINGS FEED --- */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Income History</h3>
            <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors">
                <Filter size={14} /> Filter by Level
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <th className="px-8 py-5">Source Wallet</th>
                  <th className="px-8 py-5">Source Name</th>
                  <th className="px-8 py-5">Network Level</th>
                  {/* <th className="px-8 py-5">Reward Type</th> */}
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-400 animate-pulse font-bold">Syncing Ledger...</td></tr>
                ) : earnings.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-400 italic">No referral income recorded yet.</td></tr>
                ) : (
                    earnings.map((record) => (
                    <tr key={record._id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-white group-hover:text-blue-600 transition-all">
                                    <ArrowDownLeft size={16} />
                                </div>
                                <span className="font-mono text-xs font-bold text-slate-600 italic">
                                    {record.fromWallet.slice(0, 6)}...{record.fromWallet.slice(-4)}
                                </span>
                            </div>
                        </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                                {/* <div className="p-2 bg-slate-100 rounded-lg text-slate-400 group-hover:bg-white group-hover:text-blue-600 transition-all">
                                    <ArrowDownLeft size={16} />
                                </div> */}
                                <span className="font-mono text-xs font-bold text-slate-600 italic">
                                    {record.fromName}
                                </span>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter border ${
                                record.level === 1 ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                record.level === 2 ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                                'bg-slate-50 text-slate-500 border-slate-100'
                            }`}>
                                LEVEL {record.level}
                            </span>
                        </td>
                        {/* <td className="px-8 py-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {record.type.replace('_', ' ')}
                            </span>
                        </td> */}
                        <td className="px-8 py-6 font-black text-slate-900 text-sm">
                            +{record.amount} <span className="text-[10px] text-slate-400">2PC</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-slate-700">
                                    {new Date(record.timestamp).toLocaleDateString()}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                    {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- UI HELPER COMPONENTS ---

function QuickStat({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: 'blue' | 'purple' | 'emerald' }) {
    const colorMap = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    }
    return (
        <div className={`p-6 rounded-[2rem] bg-white border border-slate-200 shadow-sm flex items-center gap-5`}>
            <div className={`p-4 rounded-2xl ${colorMap[color]} border`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{label}</p>
                <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
            </div>
        </div>
    )
}