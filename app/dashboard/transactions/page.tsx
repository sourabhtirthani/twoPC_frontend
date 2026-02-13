"use client";

import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../lib/config";
import { ArrowUpRight, Search } from "lucide-react";
import { ethers } from "ethers";

export default function TransactionsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTransactions() {
      try {
        if (!window.ethereum) {
          console.error("MetaMask not found");
          setLoading(false);
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_accounts", []);

        if (!accounts || accounts.length === 0) {
          console.warn("Wallet not connected");
          setLoading(false);
          return;
        }

        const wallet = accounts[0].toLowerCase();

        const res = await fetch(
          `${BACKEND_URL}/transaction/by-wallet?wallet=${wallet}`
        );

        const data = await res.json();

        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          setLogs([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] p-0 md:p-8 text-white">
      <div className="flex max-sm:flex-col max-sm:gap-4 justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Transaction Logs</h1>

        <div className="flex max-sm:w-full bg-[#050B24] border border-slate-800 rounded-lg overflow-hidden w-64">
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
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                logs.map((tx, i) => (
                  <tr
                    key={i}
                    className="hover:bg-[#0B122B]/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-sm font-mono text-slate-400">
                      {tx.wallet.slice(0, 6)}...{tx.wallet.slice(-4)}
                    </td>

                    <td className="px-6 py-4 text-center font-bold text-white">
                      {tx.amount}
                      <span className="text-xs text-slate-500 ml-1">
                        {tx.currency}
                      </span>
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
