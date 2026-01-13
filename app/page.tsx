"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "./lib/config";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function connectWallet() {
    try {
      setError("");

      if (!window.ethereum) {
        setError("MetaMask not installed");
        return;
      }

      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);

      // 🔑 THIS OPENS METAMASK
      const accounts = await provider.send("eth_requestAccounts", []);

      if (!accounts || accounts.length === 0) {
        setError("Wallet not connected");
        return;
      }

      const wallet = accounts[0];

      // 🔗 BACKEND CHECK
      const res = await fetch(`${BACKEND_URL}/user/wallet-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet }),
      });
      console.log(res, " response from backend");
      const data = await res.json();
      console.log(data, " data from backend");
      if (data.exists) {
        if (data.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      } else {
        // 📝 NEW USER → JOIN PAGE
        setError("You are not registered.you can not join without referral.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-xl w-[360px] text-center space-y-4">
        <h1 className="text-xl font-bold">Welcome to 2PC ICO</h1>
        <p className="text-sm text-gray-400">
          Connect your wallet to continue
        </p>

        <button
          onClick={connectWallet}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold disabled:opacity-50"
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
