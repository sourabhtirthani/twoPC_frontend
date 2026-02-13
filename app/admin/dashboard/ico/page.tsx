"use client";
import { useState, useEffect } from "react";
import StageList from "./StageList";
import CreateStage from "./CreateStage";
import { BACKEND_URL } from "../../../lib/config";

export default function StageManager() {
  const [view, setView] = useState<"list" | "create">("list");
  const [stages, setStages] = useState([]);

  const fetchStages = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/ico/all`);
      const data = await res.json();
      setStages(data);
    } catch (err) {
      console.error("Failed to fetch stages", err);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  return (
    <div className="p-0 md:p-6 bg-[#F8FAFC] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Stage</h1>
        <nav className="text-sm text-slate-500">
          Home / <span className="text-blue-600">{view === "list" ? "Stage list" : "Stage"}</span>
        </nav>
      </div>

      {view === "list" ? (
        <StageList stages={stages} onCreateClick={() => setView("create")} />
      ) : (
        <CreateStage onBack={() => { setView("list"); fetchStages(); }} />
      )}
    </div>
  );
}