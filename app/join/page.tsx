"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { TOKEN_ABI, TOKEN_ADDRESS } from "../lib/config";

const BSC_TESTNET = {
  chainId: "0x61",
  chainName: "BSC Testnet",
  rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  blockExplorerUrls: ["https://testnet.bscscan.com"],
};

export default function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [refAddress, setRefAddress] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔗 Get ref from URL */
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && ethers.isAddress(ref)) {
      setRefAddress(ref);
    }
  }, [searchParams]);

  /* 🔐 Ensure BSC Testnet */
  async function ensureBsc() {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (chainId === BSC_TESTNET.chainId) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BSC_TESTNET.chainId }],
      });
    } catch (err: any) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [BSC_TESTNET],
        });
      } else {
        throw err;
      }
    }
  }

  async function connectAndRegister() {
    try {
      if (!window.ethereum) {
        toast.error("MetaMask not installed");
        return;
      }

      if (!name.trim()) {
        toast.error("Please enter your name");
        return;
      }

      if (!refAddress || !ethers.isAddress(refAddress)) {
        toast.error("Invalid referral address");
        return;
      }

      setLoading(true);

      /* 🔗 Chain check */
      await ensureBsc();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const wallet = await signer.getAddress();

      /* 💰 Balance check */
      const balance = await provider.getBalance(wallet);
      if (balance < ethers.parseEther("0.001")) {
        toast.error("Insufficient BNB balance");
        setLoading(false);
        return;
      }

      /* 🔎 Contract */
      const token = new ethers.Contract(
        TOKEN_ADDRESS,
        TOKEN_ABI,
        signer
      );

      /* ❌ Already registered check */
      const existingRef = await token.referrer(wallet);
      if (existingRef !== ethers.ZeroAddress) {
        toast.success("Already registered");
        router.push("/dashboard");
        return;
      }

      toast.loading("Confirm transaction in MetaMask...", { id: "join" });

      /* 🚀 Blockchain call */
      const tx = await token.registerReferrer(refAddress);
      await tx.wait();

      toast.success("Joined successfully!", { id: "join" });

      /* 💾 Backend register */
      await fetch("http://localhost:5000/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          name,
          referrer: refAddress,
        }),
      });

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.shortMessage ||
        err?.message ||
        "Transaction failed",
        { id: "join" }
      );
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
          className="w-full px-3 py-2 rounded bg-gray-700 outline-none"
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
      </div>
    </div>
  );
}
