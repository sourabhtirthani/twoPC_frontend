"use client";

import { Plus, Eye, Trash2, Coins, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import {
  BACKEND_URL,
  STAKING_ABI,
  STAKING_ADDRESS,
} from "../../../lib/config";

export default function StakingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const USD_PER_2PC = 10;

  const [form, setForm] = useState({
    title: "",
    apr: "",
    lockDays: "",
    minStakeUSD: "",
    maxStakeUSD: "",
    isFixed: true,
  });

  /* ---------------- FETCH PLANS ---------------- */
  const fetchPlans = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/staking/plans`);
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      setPlans([]);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const update = (key: string, value: any) =>
    setForm({ ...form, [key]: value });

  const validate = () => {
    if (!form.title.trim()) return "Title required";
    if (+form.apr <= 0) return "Invalid APR";
    if (+form.lockDays <= 0) return "Invalid lock days";
    if (+form.minStakeUSD <= 0) return "Invalid min stake";
    if (+form.maxStakeUSD <= 0) return "Invalid max stake";
    if (+form.maxStakeUSD < +form.minStakeUSD)
      return "Max stake must be greater than min stake";
    return null;
  };


  const createPlan = async () => {
    try {
      const error = validate();
      if (error) return toast.error(error);
      if (!window.ethereum) return toast.error("MetaMask not installed");

      setLoading(true);
      toast.loading("Waiting for wallet...", { id: "stake" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, signer);
      const minStake2PC = Number(form.minStakeUSD) * USD_PER_2PC;
      const maxStake2PC = Number(form.maxStakeUSD) * USD_PER_2PC;

      toast.loading("Creating plan on blockchain...", { id: "stake" });
      const tx = await staking.createPlan(
        form.isFixed,
        Number(form.apr),
        Number(form.lockDays),
        ethers.parseUnits(minStake2PC.toString(), 18),
        ethers.parseUnits(maxStake2PC.toString(), 18)
      );


      await tx.wait();

      await fetch(`${BACKEND_URL}/staking/plan/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          apr: Number(form.apr),
          lockDays: Number(form.lockDays),
          minStake: minStake2PC,
          maxStake: maxStake2PC,
          isFixed: form.isFixed,
          txHash: tx.hash,
        }),
      });

      toast.success("Staking plan created", { id: "stake" });
      setForm({ title: "", apr: "", lockDays: "", minStakeUSD: "", maxStakeUSD: "", isFixed: true });
      fetchPlans();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to create plan", { id: "stake" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-0 md:p-8 space-y-10">

      {/* ================= CREATE PLAN SECTION ================= */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 p-4 md:px-8 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-blue-200 shadow-lg">
              <Coins className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Create Staking Plan</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Blockchain Deployment</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
            <Input label="Plan Title" placeholder="e.g. Platinum 365" value={form.title} onChange={(v: any) => update("title", v)} />
            <Input label="APR (%)" type="number" placeholder="12" value={form.apr} onChange={(v: any) => update("apr", v)} />
            <Input label="Lock Days" type="number" placeholder="365" value={form.lockDays} onChange={(v: any) => update("lockDays", v)} />
            <Input
              label="Min Stake (₹)"
              type="number"
              placeholder="100"
              value={form.minStakeUSD}
              onChange={(v: any) => update("minStakeUSD", v)}
            />

            <Input
              label="Max Stake (₹)"
              type="number"
              placeholder="5000"
              value={form.maxStakeUSD}
              onChange={(v: any) => update("maxStakeUSD", v)}
            />

            <div className="col-span-full pt-4 flex max-sm:flex-col max-sm:gap-4 items-center justify-between border-t border-slate-100 mt-2">
              <p className="text-sm text-slate-500 flex items-center gap-2 italic">
                <Info size={14} /> Gas fees apply for blockchain transactions
              </p>
              <button
                disabled={loading}
                onClick={createPlan}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-10 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-blue-100"
              >
                {loading ? "Processing..." : <><Plus size={18} /> Deploy Plan</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PLAN LIST SECTION ================= */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            Current Staking Plans
            <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">{plans.length}</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 uppercase text-[11px] font-bold tracking-widest border-b border-slate-100">
                <th className="px-8 py-5 text-left">Title</th>
                <th className="px-8 py-5 text-left">Reward (APR)</th>
                <th className="px-8 py-5 text-left">Lock Duration</th>
                <th className="px-8 py-5 text-left">Min Stake</th>
                <th className="px-8 py-5 text-left">Max Stake</th>
                <th className="px-8 py-5 text-left">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-slate-50 rounded-full text-slate-300">
                        <Coins size={32} />
                      </div>
                      <p className="text-slate-400 font-medium">No active staking plans found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                plans.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 font-bold text-slate-700">{p.title}</td>
                    <td className="px-8 py-5 text-blue-600 font-bold">{(p.apr) / 10}%</td>
                    <td className="px-8 py-5 text-slate-600 font-medium">{p.lockDays} Days</td>
                    <td className="px-8 py-5 text-slate-600 font-medium">{(p.minStake) / USD_PER_2PC} ₹</td>
                    <td className="px-8 py-5 text-slate-600 font-medium">{(p.maxStake) / USD_PER_2PC} ₹</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter shadow-sm ${p.active
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}>
                        {p.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconBtn><Eye size={16} /></IconBtn>
                        <IconBtn danger><Trash2 size={16} /></IconBtn>
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
  );
}

/* ================= HELPERS (Updated Styles) ================= */

function Input({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-300"
      />
    </div>
  );
}

function IconBtn({ children, danger }: any) {
  return (
    <button
      className={`p-2.5 rounded-lg border transition-all active:scale-90 ${danger
        ? "bg-white border-red-100 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm shadow-red-50"
        : "bg-white border-slate-200 text-slate-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm"
        }`}
    >
      {children}
    </button>
  );
}