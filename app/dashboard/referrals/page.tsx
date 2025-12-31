"use client";

import { User2, Image as ImageIcon } from "lucide-react";

interface ReferralNode {
  name: string;
  children?: ReferralNode[];
  isLast?: boolean;
}

const TreeNode = ({ node, isRoot = false }: { node: ReferralNode; isRoot?: boolean }) => {
  return (
    <div className="relative ml-8">
      {/* Vertical Line Connector */}
      {!isRoot && (
        <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-slate-700">
          {/* Horizontal Line Branch */}
          <div className="absolute top-5 left-0 w-6 h-[1px] bg-slate-700"></div>
        </div>
      )}

      <div className="flex items-center gap-3 py-2 group">
        {/* Profile Circle */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-transform group-hover:scale-110 ${
          isRoot ? "bg-blue-600 border-white/20" : "bg-teal-600/20 border-teal-500/50"
        }`}>
          <ImageIcon size={18} className="text-white/70" />
        </div>

        {/* User Name */}
        <span className="text-slate-200 font-medium tracking-wide text-sm">
          {node.name}
        </span>
      </div>

      {/* Recursive Children */}
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
  // Mock data matching your image structure
  const treeData: ReferralNode = {
    name: "metauser",
    children: [
      {
        name: "user@gmail.com",
        children: [
          { name: "sourabh" }
        ]
      },
      { name: "lalit sir" },
      { name: "param" },
      { name: "param2" }
    ]
  };

  return (
    <div className="min-h-screen bg-[#020617] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-8">Refferal tree</h1>
        
        <div className="bg-[#050B24] border border-slate-800 rounded-2xl p-10 shadow-2xl overflow-x-auto">
          {/* Start the Tree */}
          <div className="relative">
            <TreeNode node={treeData} isRoot={true} />
          </div>
        </div>
      </div>
    </div>
  );
}