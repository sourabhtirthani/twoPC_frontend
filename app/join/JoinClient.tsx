"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { BACKEND_URL, TOKEN_ABI, TOKEN_ADDRESS } from "../lib/config";

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

export default function JoinClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [refAddress, setRefAddress] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && ethers.isAddress(ref)) {
      setRefAddress(ref);
    }
  }, [searchParams]);

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
      await ensureBsc();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const wallet = await signer.getAddress();

      const token = new ethers.Contract(
        TOKEN_ADDRESS,
        TOKEN_ABI,
        signer
      );

      const existingRef = await token.referrer(wallet);
      if (existingRef !== ethers.ZeroAddress) {
        router.push("/dashboard");
        return;
      }

      toast.loading("Confirm transaction...", { id: "join" });

      const tx = await token.registerReferrer(refAddress);
      await tx.wait();
      console.log("Registering user:", { wallet, name, referrer: refAddress });
      await fetch(`${BACKEND_URL}/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet, name, referrer: refAddress }),
      });

      toast.success("Joined successfully!", { id: "join" });
      router.push("/dashboard");

    } catch (err: any) {
      toast.error(err?.message || "Transaction failed", { id: "join" });
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
          className="w-full py-3 bg-blue-600 rounded font-semibold disabled:opacity-50"
        >
          {loading ? "Processing..." : "Connect & Join"}
        </button>
      </div>
    </div>
  );
}
