"use client";

import { Search, Mail, Eye, X, Image as ImageIcon, GitGraph, User } from "lucide-react";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../../lib/config";

interface ReferralNode {
  name: string;
  children?: ReferralNode[];
}

// --- TREE NODE COMPONENT ---
const TreeNode = ({ node, isRoot = false }: { node: ReferralNode; isRoot?: boolean }) => {
  return (
    <div className="relative ml-6">
      {!isRoot && (
        <div className="absolute -left-4 top-0 bottom-0 w-[1.5px] bg-slate-200">
          <div className="absolute top-5 left-0 w-4 h-[1.5px] bg-slate-200"></div>
        </div>
      )}
      <div className="flex items-center gap-2 py-2 group">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
          isRoot ? "bg-blue-600 border-blue-400 shadow-lg shadow-blue-100" : "bg-slate-100 border-slate-200"
        }`}>
          <User size={14} className={isRoot ? "text-white" : "text-slate-400"} />
        </div>
        <span className={`text-xs font-bold tracking-tight ${isRoot ? "text-blue-600" : "text-slate-600"}`}>
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

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Referral Tree State
  const [treeData, setTreeData] = useState<ReferralNode | null>(null);
  const [loadingTree, setLoadingTree] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "tree">("info");

  useEffect(() => {
    fetch(`${BACKEND_URL}/user`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch tree data when a user is selected
  useEffect(() => {
    if (selectedUser?.wallet) {
      setLoadingTree(true);
      setActiveTab("info"); // Reset to info tab on new selection
      fetch(`${BACKEND_URL}/user/referral-tree?wallet=${selectedUser.wallet}`)
        .then((res) => res.json())
        .then((data) => setTreeData(data))
        .catch((err) => console.error("Tree fetch error:", err))
        .finally(() => setLoadingTree(false));
    }
  }, [selectedUser]);

  const filteredUsers = users.filter((user) =>
    (user.name || user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.wallet || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center text-slate-400 animate-pulse font-bold">LOADING USERS...</div>;

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
      
      {/* --- TOP BAR --- */}
      <div className="p-6 flex justify-between items-center border-b bg-slate-50/50">
        <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden w-96 shadow-sm focus-within:border-blue-500 transition-all">
          <input
            type="text"
            placeholder="Search by name or wallet..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2.5 text-sm w-full outline-none text-slate-600"
          />
          <button className="bg-blue-600 px-4 text-white hover:bg-blue-700 transition-colors">
            <Search size={18} />
          </button>
        </div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total: {filteredUsers.length} Users</p>
      </div>

      {/* --- TABLE --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
            <tr className="border-b">
              <th className="px-8 py-5">User Profile</th>
              <th className="px-8 py-5">Wallet</th>
              <th className="px-8 py-5">Role</th>
              <th className="px-8 py-5">Balance</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user, idx) => (
              <tr key={user._id || idx} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 font-bold text-xs">
                      {(user.name || user.username || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-slate-800">{user.name || user.username || "Anonymous"}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-slate-500 font-mono text-xs">
                  {user.wallet ? `${user.wallet.slice(0, 8)}...${user.wallet.slice(-6)}` : "—"}
                </td>
                <td className="px-8 py-5">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {user.role || "User"}
                  </span>
                </td>
                <td className="px-8 py-5 font-bold text-slate-700">
                  {user.balance || "0"} <span className="text-[10px] text-slate-400">2PC</span>
                </td>
                <td className="px-8 py-5 text-center">
                  <button 
                    onClick={() => setSelectedUser(user)}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- USER DETAIL MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200 border border-white/20">
            
            {/* Modal Tabs */}
            <div className="flex border-b">
                <button 
                    onClick={() => setActiveTab("info")}
                    className={`flex-1 py-5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <User size={16} /> Basic Info
                </button>
                <button 
                    onClick={() => setActiveTab("tree")}
                    className={`flex-1 py-5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'tree' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <GitGraph size={16} /> Referral Tree
                </button>
                <button onClick={() => setSelectedUser(null)} className="px-6 text-slate-300 hover:text-red-500 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {activeTab === "info" ? (
                <div className="space-y-6">
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500 to-indigo-600 p-1 mb-4 shadow-xl shadow-blue-100">
                            <div className="w-full h-full bg-white rounded-[1.8rem] flex items-center justify-center text-3xl font-black text-blue-600">
                                {selectedUser.username?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{selectedUser.username}</h4>
                        <p className="text-xs text-slate-400 font-bold font-mono mt-1">{selectedUser.wallet}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InfoBox label="Email Address" value={selectedUser.email || "N/A"} />
                        <InfoBox label="Account Role" value={selectedUser.role || "User"} />
                        <InfoBox label="Token Balance" value={`${selectedUser.balance || '0.00'} 2PC`} primary />
                        <InfoBox label="Total Staked" value={`${selectedUser.totalStaked || '0.00'} 2PC`} />
                    </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    {loadingTree ? (
                        <div className="py-10 text-center text-slate-400 font-bold text-xs animate-pulse">GENERATING TREE...</div>
                    ) : treeData ? (
                        <TreeNode node={treeData} isRoot />
                    ) : (
                        <div className="py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                            No referrals found for this user
                        </div>
                    )}
                </div>
              )}
            </div>

            {/* <div className="p-6 bg-slate-50 border-t flex gap-3">
                <button className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-300 transition-all">
                    Reset Password
                </button>
                <button onClick={() => setSelectedUser(null)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                    Done
                </button>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---
function InfoBox({ label, value, primary = false }: { label: string, value: string, primary?: boolean }) {
    return (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-sm font-bold truncate ${primary ? 'text-blue-600' : 'text-slate-700'}`}>{value}</p>
        </div>
    )
}