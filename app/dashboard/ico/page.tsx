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

  const getIcoStatus = (ico: any) => {
    const now = Date.now();
    const start = ico.start * 1000;
    const end = ico.end * 1000;

    if (!ico.active) return "Ended";
    if (now < start) return "Upcoming";
    if (now >= start && now < end) return "Running";
    return "Ended";
  };

  const isRunning = (ico: any) => {
    const now = Date.now();
    return ico.active && now >= ico.start * 1000 && now < ico.end * 1000;
  };

  return (
    <div className="min-h-screen bg-[#020617] p-8 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {icos.map((ico, i) => (
          <div key={i} className="bg-[#050B24] border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{ico.title}</h2>
              {(() => {
                const status = getIcoStatus(ico);
                return (
                  <span
                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${status === "Running"
                        ? "text-green-400 border-green-500/50 bg-green-500/10"
                        : status === "Upcoming"
                          ? "text-yellow-400 border-yellow-500/50 bg-yellow-500/10"
                          : "text-red-400 border-red-500/50 bg-red-500/10"
                      }`}
                  >
                    {status}
                  </span>
                );
              })()}

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
              disabled={!isRunning(ico)}
              onClick={() => {
                setSelected({ ...ico, phaseIndex: i });
                setView("buy");
              }}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all ${
                isRunning(ico)
                  ? "bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-90"
                  : "bg-slate-700 cursor-not-allowed opacity-50"
              }`}
            >
              {isRunning(ico) ? "Buy now" : "Not Available"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}