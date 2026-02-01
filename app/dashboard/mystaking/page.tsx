"use client";

import { Timer, Gift, AlertTriangle, CheckCircle2, ArrowRight, Info, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  STAKING_ADDRESS,
  STAKING_ABI,
  BACKEND_URL,
} from "../../lib/config";

export default function MyStakesPage() {
  const [userStakes, setUserStakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<string>("");
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedStakeIndex, setSelectedStakeIndex] = useState<number | null>(null);
  useEffect(() => {
    loadWallet();
  }, []);

  useEffect(() => {
    if (wallet) fetchUserStakes();
  }, [wallet]);

  async function loadWallet() {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_accounts", []);
    if (accounts.length) setWallet(accounts[0]);
  }

  async function fetchUserStakes() {
    try {
      // Fetching from your backend based on the wallet address
      const res = await fetch(`${BACKEND_URL}/staking/user-stakes?wallet=${wallet}`);
      const data = await res.json();
      setUserStakes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch stakes", e);
    }
  }

  /* ================= ACTION FUNCTIONS ================= */

  async function claimRewards(stakeId: number) {
  try {
    setLoading(true);
    toast.loading("Claiming rewards...", { id: "claim" });
    
    const provider = new ethers.BrowserProvider(window.ethereum!);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      STAKING_ADDRESS,
      STAKING_ABI,
      signer
    );

    // 🔗 Blockchain call
    const tx = await contract.claim(stakeId);
    await tx.wait();

    // 💾 Backend sync
    await fetch(`${BACKEND_URL}/staking/withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet,
        stakeIndex: stakeId, // ✅ FIX
        txHash: tx.hash,
      }),
    });

    toast.success("Rewards claimed successfully!", { id: "claim" });
    fetchUserStakes();
  } catch (err: any) {
    toast.error(err?.reason || err?.message || "Claim failed", { id: "claim" });
  } finally {
    setLoading(false);
  }
}



  const triggerEmergencyPopup = (index: number) => {
    setSelectedStakeIndex(index);
    setShowEmergencyModal(true);
  };
  async function executeEmergencyWithdraw() {
  if (selectedStakeIndex === null) return;

  try {
    setLoading(true);
    setShowEmergencyModal(false);
    toast.loading("Emergency protocol initiated...", { id: "emergency" });
    
    const provider = new ethers.BrowserProvider(window.ethereum!);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      STAKING_ADDRESS,
      STAKING_ABI,
      signer
    );

    // 🔗 Blockchain call
    const tx = await contract.emergencyWithdraw(selectedStakeIndex);
    await tx.wait();

    // 💾 Backend sync (CRITICAL)
    const res = await fetch(`${BACKEND_URL}/staking/emergency-withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: wallet.toLowerCase(),        // ✅ lowercase
        stakeIndex: selectedStakeIndex,      // ✅ correct index
        txHash: tx.hash,                     // ✅ store tx
      }),
    });

    if (!res.ok) {
      throw new Error("Backend emergency sync failed");
    }

    toast.success("Withdrawn with penalty", { id: "emergency" });
    fetchUserStakes();

  } catch (err: any) {
    toast.error(
      err?.reason || err?.message || "Emergency withdrawal failed",
      { id: "emergency" }
    );
  } finally {
    setLoading(false);
    setSelectedStakeIndex(null);
  }
}


  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Portfolio Manager</h1>
            <p className="text-slate-500 font-medium">Manage your active stakes and harvest rewards.</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-950 px-5 py-3 rounded-2xl border border-slate-800">
             <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-xs font-mono text-slate-400">{wallet ? `${wallet.slice(0,6)}...${wallet.slice(-4)}` : "Not Connected"}</span>
          </div>
        </div>

        {/* STAKES TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800 text-[11px] uppercase tracking-[0.2em] font-black text-slate-500">
                  <th className="px-8 py-6">Staked Asset</th>
                  <th className="px-8 py-6">Amount</th>
                  <th className="px-8 py-6">Reward (APR)</th>
                  <th className="px-8 py-6">Unlock Date</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {userStakes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center opacity-20">
                        <Timer size={48} className="mb-4" />
                        <p className="text-lg font-bold">No active stakes found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  userStakes.map((stake) => {
                    const isMatured = new Date() > new Date(stake.unlockAt);
                    return (
                      <tr key={stake._id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                              <span className="text-blue-400 font-bold text-xs">2PC</span>
                            </div>
                            <span className="font-bold text-slate-200">{stake.planTitle}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-black text-lg">{(stake.amount)*10} <span className="text-[10px] text-slate-500">2PC</span></p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                            <TrendingUp size={12} /> {(stake.apr)}%
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-sm font-medium text-slate-400">{new Date(stake.unlockAt).toLocaleDateString()}</p>
                           <p className="text-[10px] text-slate-600 uppercase font-bold tracking-tighter">Maturity Date</p>
                        </td>
                        <td className="px-8 py-6">
                          {isMatured ? (
                            <span className="flex items-center gap-1 text-emerald-500 text-xs font-black italic">
                              <CheckCircle2 size={14} /> READY TO CLAIM
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-500 text-xs font-black italic">
                              <Timer size={14} /> LOCKED
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-end gap-3">
                            {/* Emergency Withdraw - Always available but risky */}
                           {/* <button 
                                onClick={() => triggerEmergencyPopup(stake.stakeIndex)}
                                className="p-3 bg-slate-950 border border-slate-800 text-slate-500 hover:text-red-500 hover:border-red-500/50 rounded-xl transition-all shadow-sm"
                                >
                              <AlertTriangle size={18} />
                            </button> */}

                            {/* Main Claim Button */}
                            <button
                              disabled={!isMatured || loading}
                              onClick={() => claimRewards(stake.stakeIndex)}
                              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${
                                isMatured 
                                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 active:scale-95" 
                                : "bg-slate-800 text-slate-600 cursor-not-allowed"
                              }`}
                            >
                              Harvest <Gift size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TIPS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-600/5 border border-blue-500/10 rounded-2xl flex gap-4 items-start">
                <Info className="text-blue-500 shrink-0" size={20} />
                <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-blue-400 block mb-1 uppercase tracking-tighter">Harvesting Protocol:</strong>
                    Once the lock duration is completed, your "Harvest" button will activate. Clicking it will transfer your initial principal plus earned rewards directly to your connected wallet.
                </p>
            </div>
            <div className="p-6 bg-red-600/5 border border-red-500/10 rounded-2xl flex gap-4 items-start">
                <AlertTriangle className="text-red-500 shrink-0" size={20} />
                <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-red-400 block mb-1 uppercase tracking-tighter">Emergency Protocol:</strong>
                    Emergency withdrawal allows you to pull your principal out before maturity. Please note that this action typically burns your accumulated rewards and may incur a smart contract penalty fee.
                </p>
            </div>
        </div>
      </div>
      {showEmergencyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Blur Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
            onClick={() => !loading && setShowEmergencyModal(false)}
          ></div>
          
          {/* Modal Card */}
          <div className="relative w-full max-w-md bg-slate-900 border border-red-500/30 rounded-[2rem] shadow-[0_0_50px_-12px_rgba(239,68,68,0.3)] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center space-y-6">
              
              {/* Warning Icon */}
              <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                <AlertTriangle size={40} className="text-red-500" />
              </div>

              {/* Text Content */}
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Critical Action</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                    You are attempting an <span className="text-red-500 font-bold">Emergency Withdrawal</span>. 
                    This will immediately return your principal but will result in the 
                    <span className="text-white font-bold underline decoration-red-500"> total loss of all earned rewards</span>.
                </p>
              </div>

              {/* Details Box */}
              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-left">
                <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-slate-500 font-bold uppercase tracking-widest">Protocol Warning</span>
                    <span className="text-red-500 font-black tracking-tighter">PENALTY APPLIES</span>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-2">
                    <li className="flex items-start gap-2">
                        <X size={12} className="text-red-500 mt-0.5" /> 0% Rewards will be distributed
                    </li>
                    <li className="flex items-start gap-2">
                        <X size={12} className="text-red-500 mt-0.5" /> Smart contract fee may be deducted
                    </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={() => setShowEmergencyModal(false)}
                  className="py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={executeEmergencyWithdraw}
                  className="py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black shadow-lg shadow-red-600/20 transition-all active:scale-95 text-sm"
                >
                  Withdraw Anyway
                </button>
              </div>

              <p className="text-[10px] text-slate-600 font-medium">
                This transaction cannot be reversed once confirmed in your wallet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
}