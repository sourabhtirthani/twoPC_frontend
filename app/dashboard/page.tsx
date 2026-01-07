"use client";

import { useState } from "react";
import { Copy, PiggyBank, Hourglass, CreditCard, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { TOKEN_ADDRESS, BSCSCAN_API_KEY } from "../lib/config";
dayjs.extend(relativeTime);

import { ethers } from "ethers";
import { useEffect } from "react";

export default function DashboardHome() {
  const [wallet, setWallet] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  useEffect(() => {
    async function loadWallet() {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);

      if (accounts.length === 0) return;

      const address = accounts[0];
      setWallet(address);

      // build referral link
      setReferralLink(
        `${window.location.origin}/join?ref=${address}`
      );
    }

    loadWallet();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };
  async function fetchTokenTransactions() {
  try {
    const url =
      `https://api-testnet.bscscan.com/api/v2` +
      `?chainid=97` +
      `&module=account` +
      `&action=tokentx` +
      `&contractaddress=${TOKEN_ADDRESS}` +
      `&page=1` +
      `&offset=20` +
      `&sort=desc` +
      `&apikey=${BSCSCAN_API_KEY}`;

    const res = await fetch(url);

    // 🔐 Safety check (VERY IMPORTANT)
    const text = await res.text();
    if (!text.startsWith("{")) {
      console.error("Non-JSON response:", text);
      return;
    }

    const data = JSON.parse(text);
    console.log("BscScan token tx data:", data);
    if (data.status === "1") {
      console.log("TXs:", data.result);
      setTransactions(data.result);
    } else {
      console.error("BscScan error:", data.result);
      setTransactions([]);
    }
  } catch (err) {
    console.error("Failed to fetch token txs", err);
  }
}


  // useEffect(() => {
  //   fetchTokenTransactions();

  //   const interval = setInterval(fetchTokenTransactions, 30000); // every 30s
  //   return () => clearInterval(interval);
  // }, []);

  const StatCard = ({ icon: Icon, title, value, unit }: any) => (
    <div className="bg-[#050B24] border border-slate-800 p-6 rounded-xl flex items-center gap-6 shadow-xl">
      <div className="bg-[#0F172A] p-4 rounded-lg border border-slate-700">
        <Icon className="text-blue-400" size={28} />
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
          {value} <span className="text-slate-300 text-lg font-semibold">{unit}</span>
        </h2>
      </div>
    </div>
  );



  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8 text-white space-y-8">
      {/* 1. Stat Boxes Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={PiggyBank}
          title="Total deposit"
          value="1,000,000.000"
          unit="2PC"
        />
        <StatCard
          icon={Hourglass}
          title="Total withdraw"
          value="0.00000000"
          unit="2PC"
        />
        <StatCard
          icon={CreditCard}
          title="Total payment"
          value="20.11000000"
          unit="2PC"
        />
      </div>

      {/* 2. Referral Link Section */}
      <div className="space-y-3">
        <label className="text-lg font-semibold text-slate-200">Your referral link</label>
        <div className="flex w-full max-w-4xl bg-[#050B24] border border-slate-800 rounded-lg overflow-hidden ring-1 ring-slate-800">
          <input
            readOnly
            value={referralLink}
            className="bg-transparent flex-1 px-4 py-3 text-slate-300 outline-none text-sm md:text-base"
          />
          <button
            onClick={copyToClipboard}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 px-8 py-3 font-bold text-white transition-all flex items-center gap-2"
          >
            <Copy size={18} /> Copy
          </button>
        </div>
      </div>

      {/* 3. Transaction/Auction Table Section */}
      <div className="bg-[#050B24] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-xl font-bold">Transaction list</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#020617]/50 text-[#3B82F6] text-[12px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4 border-b border-slate-800">Auction Date</th>
                <th className="px-6 py-4 border-b border-slate-800">Creator</th>
                <th className="px-6 py-4 border-b border-slate-800 text-center">Remain Token</th>
                <th className="px-6 py-4 border-b border-slate-800 text-center">Base Price</th>
                <th className="px-6 py-4 border-b border-slate-800 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingTx ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.hash} className="group hover:bg-[#0B122B]/50 transition-colors">
                    {/* Time */}
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {dayjs.unix(tx.timeStamp).fromNow()}
                    </td>

                    {/* From */}
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-center font-semibold">
                      {ethers.formatUnits(tx.value, tx.tokenDecimal)} {tx.tokenSymbol}
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4 text-center text-slate-400">
                      Transfer
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`https://testnet.bscscan.com/tx/${tx.hash}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                      >
                        View <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}