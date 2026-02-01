"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Info, Coins } from "lucide-react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { 
  PRESALE_ABI, 
  PRESALE_ADDRESS, 
  BACKEND_URL, 
  TOKEN_ADDRESS, 
  TOKEN_ABI,
  USDT_ADDRESS, // Ensure this is in your config
  USDT_ABI      // Standard ERC20 ABI
} from "../../lib/config";

export default function BuyToken({ selected, onBack }: any) {
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"BNB" | "USDT">("USDT");

  const pricePerToken = Number(selected.price || 0);
  
  // Total cost in the selected currency (BNB or USDT)
  const totalCost =
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

    const costAmount = Number(totalCost);
    if (!costAmount || costAmount <= 0) {
      toast.error("Invalid total amount");
      return null;
    }

    // Min/Max Buy Validation
    if (selected.minBuy && costAmount < Number(selected.minBuy)) {
      toast.error(`Minimum buy is ${selected.minBuy} ${paymentMethod}`);
      return null;
    }

    if (selected.maxBuy && costAmount > Number(selected.maxBuy)) {
      toast.error(`Maximum buy is ${selected.maxBuy} ${paymentMethod}`);
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (now < selected.start) {
      toast.error("ICO has not started yet");
      return null;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const wallet = await signer.getAddress();

    if (paymentMethod === "BNB") {
      const balanceWei = await provider.getBalance(wallet);
      const valueWei = ethers.parseEther(costAmount.toString());
      if (balanceWei < valueWei) {
        toast.error("Insufficient BNB balance");
        return null;
      }
      return { signer, wallet, valueWei };
    } else {
      // USDT Validation
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      const balance = await usdtContract.balanceOf(wallet);
      const valueWei = ethers.parseUnits(costAmount.toString(), 18); // USDT usually 18 or 6 decimals, adjust if needed
      
      if (balance < valueWei) {
        toast.error("Insufficient USDT balance");
        return null;
      }
      return { signer, wallet, valueWei, usdtContract };
    }
  };

  /* ===================== BUY HANDLER ===================== */

  const handleBuy = async () => {
    setLoading(true);
    const toastId = "buy-toast";

    try {
      toast.loading("Checking requirements...", { id: toastId });

      const validated = await validateBeforeBuy();
      if (!validated) {
        toast.dismiss(toastId);
        setLoading(false);
        return;
      }

      const phaseId = Number(selected.phaseIndex);
      console.log("Buying tokens in phase:", phaseId);
      if (Number.isNaN(phaseId)) {
        toast.error("Invalid ICO phase", { id: toastId });
        return;
      }

      const { signer, wallet, valueWei } = validated;
      const presale = new ethers.Contract(PRESALE_ADDRESS, PRESALE_ABI, signer);

      let tx;

      if (paymentMethod === "BNB") {
        toast.loading("Confirm BNB transaction in MetaMask", { id: toastId });
        tx = await presale.buyWithBNB(phaseId, { value: valueWei });
      } else {
        // USDT FLOW: Approve -> Buy
        const { usdtContract } = validated as { signer: any; wallet: string; valueWei: bigint; usdtContract: ethers.Contract };
          
        toast.loading("Approving USDT...", { id: toastId });
        const allowance = await usdtContract.allowance(wallet, PRESALE_ADDRESS);
        
        if (allowance < valueWei) {
          const approveTx = await usdtContract.approve(PRESALE_ADDRESS, valueWei);
          await approveTx.wait();
          toast.loading("Approval successful! Confirming purchase...", { id: toastId });
        }

        toast.loading("Confirm USDT purchase in MetaMask", { id: toastId });
        tx = await presale.buyWithUSDT(phaseId, valueWei);
      }

      toast.loading("Waiting for blockchain confirmation...", { id: toastId });
      const receipt = await tx.wait();

      // Send to backend including payment currency
      await fetch(`${BACKEND_URL}/ico/purchase-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer: wallet,
          phaseId,
          txHash: receipt.hash,
          tokens: tokenAmount.toString(),
          amount: totalCost.toString(),
          currency: paymentMethod, // Added currency
        }),
      });

      toast.success("Token purchase successful 🎉", { id: toastId });
      setTokenAmount("");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.shortMessage || err?.reason || err?.message || "Transaction failed",
        { id: toastId }
      );
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold mb-3">Buy 2PC Tokens</h1>
          <p className="text-slate-400 text-sm">Select payment method and enter amount</p>
        </div>

        {/* Payment Method Selector */}
        <div className="flex gap-4 mb-8">
          {/* <button
            onClick={() => setPaymentMethod("BNB")}
            className={`flex-1 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
              paymentMethod === "BNB" 
                ? "border-blue-500 bg-blue-500/10" 
                : "border-slate-800 bg-transparent hover:border-slate-600"
            }`}
          >
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold">BNB</div>
            <span className="font-bold">BNB</span>
          </button> */}
          
          <button
            onClick={() => setPaymentMethod("USDT")}
            className={`flex-1 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
              paymentMethod === "USDT" 
                ? "border-green-500 bg-green-500/10" 
                : "border-slate-800 bg-transparent hover:border-slate-600"
            }`}
          >
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold">T</div>
            <span className="font-bold">USDT</span>
          </button>
        </div>

        {/* Pricing Info Card */}
        <div className="mb-10">
          <div className="bg-[#050B24] border-2 border-blue-500 rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl">2P</div>
              <div>
                <div className="font-bold text-lg">2PC Token</div>
                <div className="text-slate-400 text-sm">
                  {pricePerToken} {paymentMethod} / token
                </div>
              </div>
            </div>
            <CheckCircle2 className="text-blue-500" size={24} />
          </div>
        </div>

        {/* Input Section */}
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
                = {totalCost} {paymentMethod}
              </span>
            </div>
          </div>

          <p className="flex items-center gap-2 text-[#3B82F6] text-xs font-semibold">
            <Info size={14} />
            Min: {selected.minBuy || 0} · Max: {selected.maxBuy || "∞"} {paymentMethod}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
          <button
            onClick={handleBuy}
            disabled={loading}
            className="py-4 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] font-extrabold text-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                Pay with {paymentMethod}
              </>
            )}
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