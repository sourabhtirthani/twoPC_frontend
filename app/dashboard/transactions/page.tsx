"use client";

import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../lib/config";
import { ArrowUpRight, Search } from "lucide-react";

export default function TransactionsPage() {
  // Initialize as empty array to prevent .map errors
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/transaction/all`)
      .then((res) => res.json())
      .then((data) => {
        // Validation: Ensure data is an array, otherwise set empty array
        if (data && Array.isArray(data)) {
          setLogs(data);
        } else {
          setLogs([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLogs([]); // Set empty array on error
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] p-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Transaction Logs</h1>
        
        <div className="flex bg-[#050B24] border border-slate-800 rounded-lg overflow-hidden w-64">
          <input 
            type="text" 
            placeholder="Search TX Hash..." 
            className="bg-transparent px-4 py-2 text-sm outline-none w-full"
          />
          <button className="bg-blue-600 p-2">
            <Search size={18} />
          </button>
        </div>
      </div>

      <div className="bg-[#050B24] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#020617]/50 text-[#3B82F6] text-[12px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4 border-b border-slate-800">Date</th>
                <th className="px-6 py-4 border-b border-slate-800">Wallet</th>
                <th className="px-6 py-4 border-b border-slate-800 text-center">Amount</th>
                <th className="px-6 py-4 border-b border-slate-800 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">Loading...</td>
                </tr>
              ) : !Array.isArray(logs) || logs.length === 0 ? (
                /* Validation Check: Shows "No transactions found" if array is empty */
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                       <p className="text-sm italic">No transactions found in logs</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((tx, i) => (
                  <tr key={i} className="hover:bg-[#0B122B]/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-400">
                      {tx.wallet?.slice(0, 6)}...{tx.wallet?.slice(-4)}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-white">
                      {tx.amount} <span className="text-xs text-slate-500">BNB</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}