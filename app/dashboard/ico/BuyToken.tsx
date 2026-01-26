"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Info } from "lucide-react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { PRESALE_ABI, PRESALE_ADDRESS, BACKEND_URL, TOKEN_ADDRESS, TOKEN_ABI } from "../../lib/config";

export default function BuyToken({ selected, onBack }: any) {
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const pricePerToken = Number(selected.price || 0);
  const totalBNB =
    tokenAmount && pricePerToken
      ? (Number(tokenAmount) * pricePerToken).toFixed(6)
      : "0";

  /* ===================== VALIDATIONS ===================== */

  const validateBeforeBuy = async () => {
  if (!window.ethereum) {
    toast.error("MetaMask not installed");
    return null;
  }

  const tokens = Number(tokenAmount);
  if (!tokens || tokens <= 0) {
    toast.error("Enter valid token amount");
    return null;
  }

  const bnbAmount = Number(totalBNB);
  if (!bnbAmount || bnbAmount <= 0) {
    toast.error("Invalid BNB amount");
    return null;
  }

  // ✅ MIN / MAX BUY IN BNB (CORRECT)
  if (selected.minBuy && bnbAmount < Number(selected.minBuy)) {
    toast.error(`Minimum buy is ${selected.minBuy} BNB`);
    return null;
  }

  if (selected.maxBuy && bnbAmount > Number(selected.maxBuy)) {
    toast.error(`Maximum buy is ${selected.maxBuy} BNB`);
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (now < selected.start) {
    toast.error("ICO has not started yet");
    return null;
  }

  if (now > selected.end) {
    toast.error("ICO has ended");
    return null;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const wallet = await signer.getAddress();

  const balanceWei = await provider.getBalance(wallet);
  const valueWei = ethers.parseEther(bnbAmount.toString());
  console.log({ balanceWei, valueWei });
  if (balanceWei < valueWei) {
    toast.error("Insufficient BNB balance");
    return null;
  }

  return { signer, wallet, valueWei };
};


  /* ===================== BUY HANDLER ===================== */

const handleBuy = async () => {
  setLoading(true);

  try {
    toast.loading("Checking requirements...", { id: "buy" });

    const validated = await validateBeforeBuy();
    if (!validated) {
      toast.dismiss("buy");
      setLoading(false);
      return;
    }
    if (
      selected.phaseIndex === undefined ||
      Number.isNaN(Number(selected.phaseIndex))
    ) {
      toast.error("Invalid ICO phase");
      return;
    }

    const { signer, wallet, valueWei } = validated;

    const phaseId = Number(selected.phaseIndex);
    console.log("Buying tokens...",phaseId  , valueWei );

    if (!Number.isInteger(phaseId)) {
      toast.error("Invalid phase selected", { id: "buy" });
      setLoading(false);
      return;
    }

    const presale = new ethers.Contract(
      PRESALE_ADDRESS,
      PRESALE_ABI,
      signer
    );
     const token = new ethers.Contract(
      TOKEN_ADDRESS,
      TOKEN_ABI,
      signer
    );
    toast.loading("Confirm transaction in MetaMask", { id: "buy" });
    console.log("Calling buyWithBNB...", phaseId, { valueWei });
    const tx = await presale.buyWithBNB(
      phaseId,
      { value: valueWei }
    );

    toast.loading("Waiting for blockchain confirmation...", { id: "buy" });

    const receipt = await tx.wait();
    
      await fetch(`${BACKEND_URL}/ico/purchase-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer: wallet,
          phaseId,
          txHash: receipt.hash,
          tokens: tokenAmount.toString(),
          amount: totalBNB.toString(),
        }),
      });


    toast.success("Token purchase successful 🎉", { id: "buy" });
    setTokenAmount("");
  } catch (err: any) {
    console.error(err);
    toast.error(
      err?.shortMessage ||
      err?.reason ||
      err?.message ||
      "Transaction failed",
      { id: "buy" }
    );
  } finally {
    setLoading(false);
  }
};

async function resolveUplines(
  buyer: string,
  token: ethers.Contract,
  levels: bigint[],
  tokenAmount: string // ⬅️ user input like "1"
) {
  const rewards: {
    wallet: string;
    amount: string;
    level: number;
    percent: string;
  }[] = [];

  // ✅ Convert token amount to WEI ONCE

  let current = buyer;

  for (let i = 0; i < levels.length; i++) {
    current = await token.referrer(current);
    console.log(`Level ${i + 1} upline:`, current);
    if (!current || current === ethers.ZeroAddress) break;

    const percent = (Number(levels[i]) / 100) // e.g. 5 = 5%
console.log(`Level ${i + 1} percent:`, percent.toString());
    // ✅ Correct MLM calculation
    const rewardWei = (Number(tokenAmount) * Number(percent)) / (100);
    console.log(`Level ${i + 1} reward (wei):`, rewardWei.toString());
    if (rewardWei === (0)) continue; // safety

    rewards.push({
      wallet: current,
      amount: (rewardWei).toString(), // STORE WEI
      level: i + 1,
      percent: percent.toString(),
    });
  }

  return rewards;
}





  /* ===================== UI ===================== */

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 text-white">
      <div className="w-full max-w-4xl bg-[#050B24] border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative">

        <button
          onClick={onBack}
          className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={18} /> Back to Stages
        </button>

        <div className="text-center mb-10 mt-4">
          <h1 className="text-3xl font-bold mb-3">
            Buy 2PC Tokens
          </h1>
          <p className="text-slate-400 text-sm">
            Participate in the active ICO phase
          </p>
        </div>

        <div className="mb-10">
          <div className="bg-[#050B24] border-2 border-blue-500 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl">
                2P
              </div>
              <div>
                <div className="font-bold text-lg">2PC</div>
                <div className="text-slate-400 text-sm">
                  {pricePerToken} BNB / token
                </div>
              </div>
            </div>
            <CheckCircle2 className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#020617] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row gap-8">
            <div className="flex-1 flex items-center bg-[#0B122B] rounded-xl px-6 py-4 border border-slate-700">
              <input
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                className="bg-transparent w-full text-center text-2xl font-bold outline-none text-white"
                placeholder="0"
              />
              <span className="text-slate-400 font-bold ml-4">2PC</span>
            </div>

            <div className="flex-1 text-center md:text-left text-xl font-bold py-4">
              <span className="text-slate-400">
                = {totalBNB} BNB
              </span>
            </div>
          </div>

          <p className="flex items-center gap-2 text-[#3B82F6] text-xs font-semibold">
            <Info size={14} />
            Min: {selected.minBuy || 0} · Max: {selected.maxBuy || "∞"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
          <button
            onClick={handleBuy}
            disabled={loading}
            className="py-4 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] font-extrabold text-lg disabled:opacity-50"
          >
            {loading ? "Processing..." : "Pay with Crypto"}
          </button>

          <button
            disabled
            className="py-4 rounded-xl bg-[#050B24] ring-2 ring-[#A855F7]/30 font-extrabold text-lg opacity-40 cursor-not-allowed"
          >
            Pay with balance
          </button>
        </div>
      </div>
    </div>
  );
}
