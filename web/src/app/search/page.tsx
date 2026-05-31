"use client";

import { useState } from "react";
import ResultCard, { SummaryCards } from "@/components/ResultCard";
import type { MedicineMatch } from "@/lib/matcher";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MedicineMatch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/medicines/search?name=${encodeURIComponent(query.trim())}`
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults([data]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">
        🔍 Search Medicine
      </h1>
      <p className="text-sm text-gray-500 font-semibold mb-6">
        Search by brand name or generic name to find cheaper alternatives
      </p>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="bg-white rounded-2xl px-3 py-2 flex items-center gap-3 shadow-md border-2 border-gray-200 focus-within:border-emerald-500 transition-colors">
          <span className="text-xl pl-2">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type medicine name..."
            className="flex-1 py-3 text-base font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-semibold outline-none bg-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-6 py-3 rounded-xl font-extrabold text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-60 whitespace-nowrap"
          >
            {loading ? "Searching..." : "Search →"}
          </button>
        </div>
      </form>

      <p className="text-sm text-gray-500 font-semibold mb-8">
        Popular: Crocin · Metformin · Atorvastatin · Pantoprazole ·
        Azithromycin
      </p>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-6 text-red-700 font-semibold text-center">
          {error}
        </div>
      )}

      {results && (
        <>
          <SummaryCards results={results} />
          {results.map((r, i) => (
            <ResultCard key={i} match={r} />
          ))}
        </>
      )}

      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mt-4 flex gap-3">
        <span className="text-xl shrink-0">💡</span>
        <p className="text-sm text-blue-800 font-semibold leading-relaxed">
          You can search by brand name like &ldquo;Crocin&rdquo; or generic
          name like &ldquo;Paracetamol&rdquo;. Both work.
        </p>
      </div>
    </div>
  );
}
