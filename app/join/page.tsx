"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter, useSearchParams } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [refAddress, setRefAddress] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get ref from URL
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && ethers.isAddress(ref)) {
      setRefAddress(ref);
    }
  }, [searchParams]);

  async function connectAndRegister() {
    try {
      setError("");

      if (!window.ethereum) {
        setError("MetaMask not installed");
        return;
      }

      if (!name.trim()) {
        setError("Please enter your name");
        return;
      }

      if (!refAddress || !ethers.isAddress(refAddress)) {
        setError("Invalid referral address");
        return;
      }

      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const wallet = accounts[0];

      // Backend register
      const res = await fetch("http://localhost:5000/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          name,
          referrer: refAddress,
        }),
      });

      if (!res.ok) {
        throw new Error("Registration failed");
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-xl w-[380px] space-y-4">
        <h1 className="text-xl font-bold text-center">Join 2PC ICO</h1>

        <input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded bg-gray-700"
        />

        <input
          value={refAddress || "No referral"}
          readOnly
          className="w-full px-3 py-2 rounded bg-gray-700 text-sm"
        />

        <button
          onClick={connectAndRegister}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold disabled:opacity-50"
        >
          {loading ? "Processing..." : "Connect & Join"}
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  );
}
