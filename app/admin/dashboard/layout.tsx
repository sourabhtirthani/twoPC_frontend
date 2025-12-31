"use client";

import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <aside className="w-64 bg-gray-800 p-4 space-y-4">
        <h2 className="text-lg font-bold">Admin Panel</h2>

        <nav className="space-y-2">
          <Link href="/admin/dashboard">📊 Dashboard</Link>
          <Link href="/admin/dashboard/ico">🚀 Create ICO</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
