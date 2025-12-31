"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      if (!window.ethereum) {
        router.push("/");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);

      if (accounts.length === 0) {
        router.push("/");
        return;
      }

      const wallet = accounts[0];

      const res = await fetch("http://localhost:3000/user/wallet-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet }),
      });

      const data = await res.json();

      if (!data.exists || data.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }

    checkAdmin();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p>Only admins can see this</p>
    </div>
  );
}
