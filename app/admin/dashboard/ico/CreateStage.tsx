"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { PRESALE_ABI, PRESALE_ADDRESS, BACKEND_URL } from "../../../lib/config";

export default function CreateStage({ onBack }: any) {
  const [form, setForm] = useState({
    title: "",
    totalTokens: "",
    price: "",
    minBuy: "",
    maxBuy: "",
    hardCap: "",
    start: "",
    end: "",
  });

  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form, val: string) => {
  setForm((prev) => ({ ...prev, [key]: val }));
};

  /* 🔐 VALIDATION */
  const validate = () => {
    if (!form.title) return "Stage title required";
    if (!form.price || Number(form.price) <= 0) return "Invalid price";
    if (!form.hardCap || Number(form.hardCap) <= 0) return "Invalid hard cap";
    if (!form.start || !form.end) return "Start & End dates required";
    if (new Date(form.start) >= new Date(form.end))
      return "Start date must be before end date";
    return null;
  };

  const handleSubmit = async () => {
    try {
      const error = validate();
      if (error) {
        toast.error(error);
        return;
      }

      if (!window.ethereum) {
        toast.error("MetaMask not installed");
        return;
      }

      setLoading(true);

      /* 🔗 WALLET */
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      /* ⛓️ CONTRACT */
      const presale = new ethers.Contract(
        PRESALE_ADDRESS,
        PRESALE_ABI,
        signer
      );

      /* 🔢 FORMAT DATA */
      const priceWei = ethers.parseEther(form.price);
      const minBuyWei = form.minBuy
        ? ethers.parseEther(form.minBuy)
        : BigInt(0);
      const maxBuyWei = form.maxBuy
        ? ethers.parseEther(form.maxBuy)
        : BigInt(0);

      const startTs = Math.floor(
        new Date(form.start).getTime() / 1000
      );
      const endTs = Math.floor(
        new Date(form.end).getTime() / 1000
      );

      const hardCapWei = ethers.parseEther(form.hardCap);

      toast.loading("Waiting for blockchain confirmation...", {
        id: "create-stage",
      });

      /* 🚀 BLOCKCHAIN CALL */
      const tx = await presale.addPhase(
        priceWei,
        startTs,
        endTs,
        minBuyWei,
        maxBuyWei,
        hardCapWei
      );
      await tx.wait();

      /* 💾 DB SAVE */
      await fetch(`${BACKEND_URL}/ico/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          price: form.price,
          minBuy: form.minBuy,
          maxBuy: form.maxBuy,
          hardCap: form.hardCap,
          start: startTs,
          end: endTs,
          totalTokens: form.totalTokens,
        }),
      });

      toast.success("ICO Stage created successfully", {
        id: "create-stage",
      });

      onBack(); // go back to list
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.shortMessage ||
          err?.message ||
          "ICO creation failed",
        { id: "create-stage" }
      );
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="p-4 flex justify-end border-b border-slate-100">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-50"
        >
          <ArrowLeft size={16} /> List
        </button>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField 
  label="Stage title" 
  name="title" 
  form={form} 
  update={update} 
/>
        <InputField label="Total token issues" name="totalTokens" form={form} update={update} />
        <InputField label="Token base price (BNB)" name="price" form={form} update={update} />
        <InputField label="Min buy (BNB)" name="minBuy" form={form} update={update} />
        <InputField label="Max buy (BNB)" name="maxBuy" form={form} update={update} />
        <InputField label="Hard cap (BNB)" name="hardCap" form={form} update={update} />
        <InputField label="Start date" type="datetime-local" name="start"  form={form} update={update}/>
        <InputField label="End date" type="datetime-local" name="end" form={form} update={update} />

        <div className="md:col-span-2 mt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#22C55E] hover:bg-green-600 text-white px-6 py-2.5 rounded-md font-semibold"
          >
            {loading ? "Processing..." : "Create stage"}
          </button>
        </div>
      </div>
    </div>
  );
}

// MOVE THIS HERE (Outside the main function)

const InputField = ({
  label,
  type = "text",
  name,
  form,    // Add this prop
  update,  // Add this prop
}: {
  label: string;
  type?: string;
  name: any;
  form: any;
  update: any;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium text-slate-600">{label}</label>
    <input
      type={type}
      value={form[name] ?? ""}
      onChange={(e) => update(name, e.target.value)}
      className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-white text-slate-900 focus:border-blue-500 outline-none"
    />
  </div>
);