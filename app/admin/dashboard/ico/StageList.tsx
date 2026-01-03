"use client";

import { Search, Plus, Eye, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../../lib/config";

export default function StageList({ onCreateClick }: any) {
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<any | null>(null); // Track which stage to show in popup

  useEffect(() => {
    fetch(`${BACKEND_URL}/ico/all`)
      .then((res) => res.json())
      .then((data) => setStages(data))
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading stages...</div>;
  }

  if (!stages.length) {
    return (
      <div className="bg-white p-10 rounded-lg border text-center">
        <p className="text-gray-500 mb-4">No ICO stages found</p>
        <button
          onClick={onCreateClick}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create first stage
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
      {/* --- HEADER --- */}
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex border rounded-md overflow-hidden w-64">
          <input
            type="text"
            placeholder="Plan Name"
            className="px-3 py-1.5 text-sm w-full outline-none"
          />
          <button className="bg-blue-500 p-2 text-white">
            <Search size={16} />
          </button>
        </div>

        <button
          onClick={onCreateClick}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1"
        >
          <Plus size={18} /> Create stage
        </button>
      </div>

      {/* --- TABLE --- */}
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Stage</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Start</th>
            <th className="px-4 py-3">End</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {stages.map((stage, i) => (
            <tr key={i} className="border-t text-black hover:bg-slate-50">
              <td className="px-4 py-3">{i + 1}</td>
              <td className="px-4 py-3 font-medium">{stage.title}</td>
              <td className="px-4 py-3">{stage.price} BNB</td>
              <td className="px-4 py-3">
                {new Date(stage.start * 1000).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                {new Date(stage.end * 1000).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                  Active
                </span>
              </td>
              <td className="px-4 py-3 text-right flex justify-end gap-2">
                <button 
                  onClick={() => setSelectedStage(stage)}
                  className="p-1.5 border rounded text-blue-500 hover:bg-blue-50"
                >
                  <Eye size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- DETAILS POPUP (MODAL) --- */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">Stage Details</h3>
              <button 
                onClick={() => setSelectedStage(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <DetailRow label="Stage Title" value={selectedStage.title} />
              <DetailRow label="Token Price" value={`${selectedStage.price} BNB`} />
              <DetailRow label="Total Tokens" value={selectedStage.totalTokens} />
              <DetailRow label="Hard Cap" value={`${selectedStage.hardCap} BNB`} />
              <DetailRow label="Min Buy" value={`${selectedStage.minBuy} BNB`} />
              <DetailRow label="Max Buy" value={`${selectedStage.maxBuy} BNB`} />
              <hr className="border-slate-100" />
              <DetailRow 
                label="Start Date" 
                value={new Date(selectedStage.start * 1000).toLocaleString()} 
              />
              <DetailRow 
                label="End Date" 
                value={new Date(selectedStage.end * 1000).toLocaleString()} 
              />
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button 
                onClick={() => setSelectedStage(null)}
                className="bg-slate-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for the popup rows
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="text-slate-900 font-semibold text-sm">{value || "N/A"}</span>
    </div>
  );
}