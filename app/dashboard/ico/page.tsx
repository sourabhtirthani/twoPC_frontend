"use client";

import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../lib/config";
import BuyToken from "./BuyToken"; // We will create this below

export default function IcoPage() {
  const [icos, setIcos] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [view, setView] = useState<"list" | "buy">("list");

  useEffect(() => {
    fetch(`${BACKEND_URL}/ico/active`)
      .then((res) => res.json())
      .then(setIcos);
  }, []);

  const formatDate = (dateString: any) => {
    const date = new Date(typeof dateString === 'number' ? dateString * 1000 : dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  if (view === "buy" && selected) {
    return <BuyToken selected={selected} onBack={() => setView("list")} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] p-8 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {icos.map((ico, i) => (
          <div key={i} className="bg-[#050B24] border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{ico.title}</h2>
              <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                ico.status === 'Running' || !ico.status 
                ? "text-green-400 border-green-500/50 bg-green-500/10" 
                : "text-red-400 border-red-500/50 bg-red-500/10"
              }`}>
                {ico.status || "Running"}
              </span>
            </div>

            <div className="text-2xl font-bold mb-8 flex items-center gap-2">
              <span className="text-[#3B82F6]">1 2PC</span>
              <span className="text-white text-xl">=</span>
              <span className="text-white">{ico.price} INR</span>
            </div>

            <div className="space-y-4 text-sm mb-8">
              <div className="flex justify-between items-baseline py-2 border-b border-dashed border-slate-800">
                <span className="text-slate-400 font-bold">Available tokens</span>
                <span className="text-slate-100">: {ico.available || '32252226'} 2PC</span>
              </div>
              <div className="flex justify-between items-baseline py-2 border-b border-dashed border-slate-800">
                <span className="text-slate-400 font-bold">Bonus tokens</span>
                <span className="text-slate-100">: {ico.bonus || '0'} 2PC</span>
              </div>
              <div className="flex justify-between items-baseline py-2 border-b border-dashed border-slate-800">
                <span className="text-slate-400 font-bold">Start date</span>
                <span className="text-slate-100">: {formatDate(ico.start)}</span>
              </div>
              <div className="flex justify-between items-baseline py-2">
                <span className="text-slate-400 font-bold">End date</span>
                <span className="text-slate-100">: {formatDate(ico.end)}</span>
              </div>
            </div>

            <button
              onClick={() => { setSelected(ico); setView("buy"); }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] font-bold text-white shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all"
            >
              Buy now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}