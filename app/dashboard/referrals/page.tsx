"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { BACKEND_URL } from "../../lib/config";

interface ReferralNode {
  name: string;
  children?: ReferralNode[];
}

const TreeNode = ({
  node,
  isRoot = false,
}: {
  node: ReferralNode;
  isRoot?: boolean;
}) => {
  return (
    <div className="relative ml-8">
      {/* Connector lines */}
      {!isRoot && (
        <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-slate-700">
          <div className="absolute top-5 left-0 w-6 h-[1px] bg-slate-700"></div>
        </div>
      )}

      <div className="flex items-center gap-3 py-2 group">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-transform group-hover:scale-110 ${isRoot
            ? "bg-blue-600 border-white/20"
            : "bg-teal-600/20 border-teal-500/50"
            }`}
        >
          <ImageIcon size={18} className="text-white/70" />
        </div>

        <span className="text-slate-200 font-medium tracking-wide text-sm">
          {node.name}
        </span>
      </div>

      {node.children && node.children.length > 0 && (
        <div className="mt-1">
          {node.children.map((child, index) => (
            <TreeNode key={index} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function ReferralTreePage() {
  const [treeData, setTreeData] = useState<ReferralNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTree() {
      try {
        if (!window.ethereum) {
          setError("Wallet not connected");
          setLoading(false);
          return;
        }

        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (!accounts || accounts.length === 0) {
          setError("Wallet not connected");
          setLoading(false);
          return;
        }

        const wallet = accounts[0];

        const res = await fetch(
          `${BACKEND_URL}/user/referral-tree?wallet=${wallet}`
        );

        if (!res.ok) {
          throw new Error("Failed to load referral tree");
        }

        const data = await res.json();
        setTreeData(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchTree();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] p-0 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">
          Referral Tree
        </h1>

        <div className="bg-[#050B24] border border-slate-800 rounded-2xl p-10 shadow-2xl overflow-x-auto">
          {loading ? (
            <p className="text-slate-400 text-center">Loading tree...</p>
          ) : error ? (
            <p className="text-red-400 text-center">{error}</p>
          ) : treeData ? (
            <TreeNode node={treeData} isRoot />
          ) : (
            <p className="text-slate-400 text-center">
              No referral data found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
