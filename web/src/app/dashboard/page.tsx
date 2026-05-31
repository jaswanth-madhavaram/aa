"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<{ medicines_in_db: number } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 font-bold">Loading...</div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
            👤
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Welcome, {session.user.name}!
            </h1>
            <p className="text-sm text-gray-500 font-semibold">
              {session.user.email}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-emerald-50 rounded-2xl p-5 border-2 border-emerald-200 text-center">
            <div className="text-2xl font-black text-emerald-700">
              {stats?.medicines_in_db || "..."}
            </div>
            <div className="text-xs font-bold uppercase text-emerald-600 mt-1">
              Medicines in DB
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-200 text-center">
            <div className="text-2xl font-black text-blue-700">AI</div>
            <div className="text-xs font-bold uppercase text-blue-600 mt-1">
              OCR Engine
            </div>
          </div>
          <div className="bg-amber-50 rounded-2xl p-5 border-2 border-amber-200 text-center">
            <div className="text-2xl font-black text-amber-700">80%</div>
            <div className="text-xs font-bold uppercase text-amber-600 mt-1">
              Avg. Savings
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-extrabold text-gray-900 mb-4">
        Quick Actions
      </h2>
      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          href="/search"
          className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-200 hover:border-emerald-300 hover:-translate-y-1 transition-all text-center group"
        >
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="font-extrabold group-hover:text-emerald-700 transition-colors">
            Search Medicine
          </h3>
          <p className="text-xs text-gray-500 mt-1">Find cheaper alternatives</p>
        </Link>
        <Link
          href="/upload"
          className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-200 hover:border-emerald-300 hover:-translate-y-1 transition-all text-center group"
        >
          <div className="text-3xl mb-2">📷</div>
          <h3 className="font-extrabold group-hover:text-emerald-700 transition-colors">
            Upload Prescription
          </h3>
          <p className="text-xs text-gray-500 mt-1">AI reads your Rx</p>
        </Link>
        <Link
          href="/browse"
          className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-200 hover:border-emerald-300 hover:-translate-y-1 transition-all text-center group"
        >
          <div className="text-3xl mb-2">📋</div>
          <h3 className="font-extrabold group-hover:text-emerald-700 transition-colors">
            Browse Database
          </h3>
          <p className="text-xs text-gray-500 mt-1">Explore all medicines</p>
        </Link>
      </div>
    </div>
  );
}
