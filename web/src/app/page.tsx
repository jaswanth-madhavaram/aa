"use client";

import { useState } from "react";
import Link from "next/link";
import ResultCard, { SummaryCards } from "@/components/ResultCard";
import type { MedicineMatch } from "@/lib/matcher";

export default function HomePage() {
  const [query, setQuery] = useState("Augmentin");
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
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-emerald-900 to-emerald-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            💊 Find Cheaper Medicines
            <br />
            <span className="text-emerald-300">Save Up to 80%</span>
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
            Type any medicine name and instantly see affordable generic
            alternatives with real price comparisons
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="max-w-2xl mx-auto -mt-7 px-6 relative z-10">
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl px-3 py-2 flex items-center gap-3 shadow-xl shadow-gray-900/10 border-2 border-transparent focus-within:border-emerald-500 transition-colors"
        >
          <span className="text-2xl pl-2">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Augmentin, Crocin, Lipitor..."
            className="flex-1 py-3 text-lg font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-semibold outline-none bg-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-6 py-3 rounded-xl font-extrabold text-sm hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 whitespace-nowrap"
          >
            {loading ? "Searching..." : "Search →"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-3 font-semibold">
          💡 Try: Crocin · Augmentin · Metformin · Lipitor · Paracetamol
        </p>
      </section>

      {/* How it Works */}
      <section className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
          ✨ How It Works
        </h2>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            {
              icon: "📸",
              num: 1,
              title: "Upload or Search",
              desc: "Take a photo of your prescription or type the medicine name",
            },
            {
              icon: "🤖",
              num: 2,
              title: "AI Finds Alternatives",
              desc: "AI matches brands to their generic salt compositions instantly",
            },
            {
              icon: "💰",
              num: 3,
              title: "Save Money",
              desc: "See ranked cheaper options including Jan Aushadhi store prices",
            },
          ].map((step) => (
            <div
              key={step.num}
              className="bg-white rounded-2xl p-7 text-center shadow-md border-2 border-gray-200 hover:-translate-y-1 transition-transform"
            >
              <div className="text-4xl mb-3">{step.icon}</div>
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white font-black text-lg mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                {step.num}
              </div>
              <h3 className="font-extrabold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-5xl mx-auto px-6 mt-12 mb-6">
        <div className="grid sm:grid-cols-2 gap-5">
          <Link
            href="/upload"
            className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-200 hover:border-emerald-300 hover:-translate-y-1 transition-all group"
          >
            <div className="text-3xl mb-3">📷</div>
            <h3 className="font-extrabold text-lg mb-1 group-hover:text-emerald-700 transition-colors">
              Upload Prescription
            </h3>
            <p className="text-sm text-gray-500">
              AI reads your prescription image and finds cheaper alternatives
              for all medicines
            </p>
          </Link>
          <Link
            href="/browse"
            className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-200 hover:border-emerald-300 hover:-translate-y-1 transition-all group"
          >
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-extrabold text-lg mb-1 group-hover:text-emerald-700 transition-colors">
              Browse Database
            </h3>
            <p className="text-sm text-gray-500">
              Explore 700+ medicines with brand vs generic price comparisons
            </p>
          </Link>
        </div>
      </section>

      {/* Results */}
      {(results || error) && (
        <section className="max-w-5xl mx-auto px-6 pb-12">
          <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
            📋 Results for &ldquo;{query}&rdquo;
          </h2>
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 text-red-700 font-semibold">
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
        </section>
      )}

      {/* Disclaimer */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex gap-3">
          <span className="text-xl shrink-0">⚠️</span>
          <p className="text-sm text-amber-800 font-semibold leading-relaxed">
            <strong>Important:</strong> Medico.AI is an information tool only.
            Always consult a registered pharmacist or doctor before switching
            any medicine. Generic medicines contain the same active ingredient
            but please verify with your healthcare provider.
          </p>
        </div>
      </section>
    </>
  );
}
