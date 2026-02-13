"use client";

import { Wallet, TrendingUp, Lock, ArrowUpRight, X, Info, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  STAKING_ADDRESS,
  STAKING_ABI,
  TOKEN_ADDRESS,
  TOKEN_ABI,
  BACKEND_URL,
} from "../../lib/config";

export default function UserStaking() {
  const [plans, setPlans] = useState<any[]>([]);
  const [wallet, setWallet] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [rewards, setRewards] = useState<string>("0");
  const [totalTokensStaked, setTotalTokensStaked] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  // Modal State
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [stakeAmountUSD, setStakeAmountUSD] = useState<string>("");
  const USD_PER_2PC = 10; // 1 2PC = 0.10 ₹

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      await loadWallet();
      await fetchPlans();
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    if (wallet) {
      fetchBalance();
      fetchRewards();
    }
  }, [wallet]);

  async function loadWallet() {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_accounts", []);
    if (accounts.length) setWallet(accounts[0]);
  }

  async function fetchPlans() {
    const res = await fetch(`${BACKEND_URL}/staking/plans`);
    const data = await res.json();
    setPlans(Array.isArray(data) ? data : []);
  }

  async function fetchRewards() {
    const res = await fetch(`${BACKEND_URL}/staking/rewards?wallet=${wallet}`);

    const data = await res.json();
    setRewards(data.totalRewards || "0");
    setTotalTokensStaked(data.totalStaked || "0");
    // setPlans(Array.isArray(data) ? data : []);
  }

  async function fetchBalance() {
    if (!window.ethereum || !wallet) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const token = new ethers.Contract(
      TOKEN_ADDRESS,
      TOKEN_ABI,
      provider
    );

    // 🔗 Read from blockchain
    const balanceWei = await token.balanceOf(wallet);

    // 18 decimals → human readable
    const balance = ethers.formatUnits(balanceWei, 18);
    setBalance(balance);
  }


  /* ================= STAKE LOGIC ================= */

  async function handleStake() {
    try {
      if (!wallet) return toast.error("Connect wallet first");
      if (!stakeAmountUSD || Number(stakeAmountUSD) <= 0)
        return toast.error("Enter a valid ₹ amount");

      const stakeUsd = Number(stakeAmountUSD);
      const stake2pc = stakeUsd / USD_PER_2PC;

      if (stake2pc <= 0)
        return toast.error("Stake amount too small");

      const amountWei = ethers.parseUnits((stake2pc * USD_PER_2PC).toString(), 19);
      console.log("stake2pc", stake2pc * USD_PER_2PC, " amountWei:", amountWei.toString());
      if ((stake2pc * USD_PER_2PC) < Number(selectedPlan.minStake / USD_PER_2PC)) {
        return toast.error(
          `Minimum stake is ${selectedPlan.minStake / USD_PER_2PC} ₹`
        );
      }

      if (stake2pc > Number(balance)) {
        return toast.error("Insufficient 2PC balance");
      }

      setLoading(true);
      toast.loading("Preparing transaction...", { id: "stake" });

      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();

      const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const allowance = await token.allowance(wallet, STAKING_ADDRESS);

      if (allowance < amountWei) {
        toast.loading("Approving tokens...", { id: "stake" });
        const approveTx = await token.approve(STAKING_ADDRESS, amountWei);
        await approveTx.wait();
      }

      const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      console.log("Staking plan:", selectedPlan.planId, " amountWei:", amountWei);
      toast.loading("Confirm staking in wallet...", { id: "stake" });
      const tx = await staking.stake(selectedPlan.planId, amountWei);
      const receipt = await tx.wait();

      await fetch(`${BACKEND_URL}/staking/stake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          planId: selectedPlan.planId,
          amount: stake2pc * USD_PER_2PC, // store actual 2PC
          txHash: receipt.hash,
        }),
      });

      toast.success("Staked Successfully!", { id: "stake" });
      setSelectedPlan(null);
      setStakeAmountUSD("");
      fetchBalance();
    } catch (err: any) {
      toast.error(err?.reason || err?.message || "Staking failed", {
        id: "stake",
      });
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* HEADER STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={<Wallet className="text-blue-400" size={24} />}
            label="Available Balance"
            value={`${Number(balance).toLocaleString()} 2PC`}
            subtext="In your wallet"
          />
          <StatCard
            icon={<Lock className="text-amber-400" size={24} />}
            label="Total Staked"
            value={`${Number(totalTokensStaked).toLocaleString()} 2PC`}
            subtext="Active assets"
          />
          <StatCard
            icon={<TrendingUp className="text-emerald-400" size={24} />}
            label="Rewards Earned"
            value={`${Number(rewards).toLocaleString()} 2PC`}
            subtext="Cumulative profit"
          />
        </div>

        {/* PLANS GRID */}
        <div>
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <ShieldCheck className="text-blue-500" /> Available Staking Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 md:p-8 relative overflow-hidden group hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10"
              >
                {/* APR Badge */}
                <div className="absolute top-0 right-0 px-6 py-2 bg-blue-600 text-white font-black rounded-bl-2xl shadow-lg">
                  {(plan.apr) / 10}% APR
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white">{plan.title}</h3>
                    <p className="text-slate-400 font-medium">{plan.lockDays} Days Duration</p>
                  </div>

                  <div className="space-y-3 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Min Stake</span>
                      <span className="text-white font-bold">{(plan.minStake) / USD_PER_2PC} ₹</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Max Stake</span>
                      <span className="text-white font-bold">{(plan.maxStake) / USD_PER_2PC} ₹</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-slate-700/50 pt-3">
                      <span className="text-slate-400 font-medium">Type</span>
                      <span className="text-blue-400 font-bold uppercase tracking-wider text-xs">
                        {plan.isFixed ? "Fixed Term" : "Flexible"}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={loading || !plan.active}
                    onClick={() => setSelectedPlan(plan)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    Stake Now <ArrowUpRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= STAKING MODAL ================= */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => !loading && setSelectedPlan(null)}
          ></div>

          {/* Modal Card */}
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 space-y-8">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white">Confirm Stake</h3>
                  <p className="text-slate-400 text-sm">Plan: {selectedPlan.title}</p>
                </div>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-500" />
                </button>
              </div>

              {/* Input Area */}
              <div className="space-y-4">
                <div className="flex justify-between items-end px-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Amount to Stake</label>
                  <span className="text-xs text-slate-400">Balance: {Number(balance).toFixed(2)} 2PC</span>
                </div>
                <div className="relative group">
                  <input
                    type="number"
                    placeholder="Enter ₹ amount"
                    value={stakeAmountUSD}
                    onChange={(e) => setStakeAmountUSD(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-800 focus:border-blue-600 rounded-2xl py-5 px-6 text-xl md:text-2xl font-bold outline-none transition-all placeholder:text-slate-800"

                  />

                  <button
                    onClick={() => setStakeAmountUSD(balance)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600/10 text-blue-400 text-xs font-black px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">You Will Stake</span>
                  <span className="text-white font-bold">
                    {stakeAmountUSD
                      ? (Number(stakeAmountUSD) * USD_PER_2PC).toFixed(4)
                      : "0"}{" "}
                    2PC
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Estimated APR</span>
                  <span className="text-blue-400 font-bold">{(selectedPlan.apr) / 10}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Lock Period</span>
                  <span className="text-white font-medium">{selectedPlan.lockDays} Days</span>
                </div>
                <div className="flex justify-between text-sm border-t border-slate-800 pt-3">
                  <span className="text-slate-400">Estimated Reward</span>
                  <span className="text-emerald-400 font-bold">
                    {stakeAmountUSD
                      ? (
                        ((Number(stakeAmountUSD) / USD_PER_2PC) *
                          (selectedPlan.apr / 10000) *
                          selectedPlan.lockDays) /
                        365
                      ).toFixed(4)
                      : "0"}{" "}
                    2PC
                  </span>

                </div>
              </div>

              {/* Action */}
              <button
                disabled={loading}
                onClick={handleStake}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm & Stake Now"}
              </button>

              <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
                <Info size={10} /> Transactions are irreversible on the blockchain.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subtext }: any) {
  return (
    <div className="bg-slate-800/40 p-5 md:p-8 rounded-[2rem] border border-slate-700/50 flex items-center gap-6">
      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
        {icon}
      </div>
      <div>
        <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl md:text-3xl font-black text-white">{value}</p>
        <p className="text-[10px] md:text-xs text-slate-500 font-medium mt-1">{subtext}</p>
      </div>
    </div>
  );
}