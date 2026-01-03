"use client";

import { Search, Mail, Eye, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../../lib/config";

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Replace with your actual users endpoint
    fetch(`${BACKEND_URL}/user`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  }, []);
  console.log("Fetched users:", users);
  // Filter users based on search input
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.wallet?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log("Filtered users:", filteredUsers);
  if (loading) return <div className="p-6 text-gray-500">Loading users...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* --- TOP BAR --- */}
      <div className="p-4 flex justify-between items-center border-b bg-white">
        <div className="flex border rounded-md overflow-hidden w-80">
          <input
            type="text"
            placeholder="username or email or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 text-sm w-full outline-none text-slate-600"
          />
          <button className="bg-blue-500 px-3 text-white hover:bg-blue-600 transition-colors">
            <Search size={18} />
          </button>
        </div>

        {/* <button className="bg-[#56A4F5] text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-blue-500 transition-all">
          <Mail size={16} /> Bulk mail
        </button> */}
      </div>

      {/* --- TABLE --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F8FAFC] text-slate-500 uppercase text-[11px] font-bold">
            <tr className="border-b">
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Wallet address</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Balance</th>
              <th className="px-6 py-4">reffer By</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
         <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((user, idx) => (
                <tr key={user._id || idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        {/* Use user.name or user.username consistently */}
                        <span className="text-xs font-bold">
                        {(user.name || user.username || "U").charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <span className="font-medium text-slate-700">
                        {user.name || user.username || "Unknown User"}
                    </span>
                    </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                    {/* Shorten wallet address for better UI */}
                    {user.wallet ? `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}` : "No Wallet"}
                </td>
                <td className="px-6 py-4">
                    <span className="capitalize px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs">
                    {user.role || "User"}
                    </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                    {user.balance || "0"} 2PC
                </td>
                <td className="px-6 py-4 text-slate-500">
                    {user.referrer || "Direct"}
                </td>
                <td className="px-6 py-4 text-center">
                    <button 
                    onClick={() => setSelectedUser(user)}
                    className="p-2 border border-blue-200 rounded text-blue-500 hover:bg-blue-50"
                    >
                    <Eye size={16} />
                    </button>
                </td>
                </tr>
            ))}
        </tbody>
        </table>
      </div>

      {/* --- USER DETAIL MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-slate-800">User Information</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
               <div className="flex flex-col items-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center mb-2">
                     <span className="text-2xl font-bold text-blue-600">{selectedUser.username?.charAt(0).toUpperCase()}</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">{selectedUser.username}</h4>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
               </div>
               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Total Tokens</p>
                    <p className="font-semibold">{selectedUser.tokens || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Balance</p>
                    <p className="font-semibold text-blue-600">{selectedUser.balance || "0.00"} 2PC</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Joined On</p>
                    <p className="font-semibold">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold">Status</p>
                    <p className="font-semibold text-green-600">Verified</p>
                  </div>
               </div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button onClick={() => setSelectedUser(null)} className="bg-slate-800 text-white px-4 py-2 rounded text-sm font-medium hover:bg-slate-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}