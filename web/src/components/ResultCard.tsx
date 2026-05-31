"use client";

import type { MedicineMatch, Alternative } from "@/lib/matcher";

function rupee(val: number) {
  return `₹${val.toFixed(2)}`;
}

function Badge({ type, score }: { type: string; score?: number }) {
  const styles: Record<string, string> = {
    exact: "bg-emerald-50 text-emerald-700 border-emerald-300",
    fuzzy: "bg-amber-50 text-amber-700 border-amber-300",
    salt: "bg-blue-50 text-blue-700 border-blue-300",
    none: "bg-gray-100 text-gray-500 border-gray-300",
  };

  const labels: Record<string, string> = {
    exact: "Exact Match",
    fuzzy: `Fuzzy (${score || 0}%)`,
    salt: "Generic Match",
    none: "Not Found",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
        styles[type] || styles.none
      }`}
    >
      {type === "exact" && "✓ "}
      {labels[type] || type}
    </span>
  );
}

function AlternativeRow({ alt, index, isWeb }: { alt: Alternative; index: number; isWeb?: boolean }) {
  if (!alt.price_available) {
    return (
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3.5">
          <div className="font-extrabold text-gray-900">{alt.brand_name}</div>
          {isWeb && (
            <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
              Web Source
            </span>
          )}
        </td>
        <td className="px-4 py-3.5 text-sm text-gray-600">{alt.generic_name}</td>
        <td className="px-4 py-3.5 text-sm text-gray-600">{alt.manufacturer}</td>
        <td className="px-4 py-3.5 text-sm text-gray-500">
          {[alt.strength, alt.form].filter(Boolean).join(" ")}
        </td>
        <td className="px-4 py-3.5">
          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
            Unavailable
          </span>
        </td>
        <td className="px-4 py-3.5">
          <span className="text-xs font-bold text-gray-400">N/A</span>
        </td>
      </tr>
    );
  }

  return (
    <tr className={`hover:bg-gray-50 transition-colors ${index === 0 ? "bg-emerald-50/50" : ""}`}>
      <td className="px-4 py-3.5">
        <div className="font-extrabold text-gray-900">{alt.brand_name}</div>
        {index === 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            ★ Best Value
          </span>
        )}
        {index === 0 && alt.jan_aushadhi_price && (
          <span className="inline-flex items-center px-2 py-0.5 mt-1 ml-1 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200">
            Jan Aushadhi
          </span>
        )}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-600">{alt.generic_name}</td>
      <td className="px-4 py-3.5 text-sm text-gray-600">{alt.manufacturer}</td>
      <td className="px-4 py-3.5 text-sm text-gray-500">
        {[alt.strength, alt.form].filter(Boolean).join(" ")}
      </td>
      <td className="px-4 py-3.5">
        <span className={`font-extrabold ${index === 0 ? "text-emerald-700" : "text-orange-600"}`}>
          {rupee(alt.brand_price)}
        </span>
      </td>
      <td className="px-4 py-3.5">
        {alt.savings_pct > 0 ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-700">
            Save {alt.savings_pct.toFixed(0)}%
          </span>
        ) : (
          <span className="text-xs font-bold text-gray-400">Branded</span>
        )}
      </td>
    </tr>
  );
}

export default function ResultCard({ match }: { match: MedicineMatch }) {
  const alts = match.alternatives || [];
  const best = alts[0];

  if (match.match_type === "none" || match.error) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-md overflow-hidden mb-6">
        <div className="p-5 bg-gray-50 border-b-2 border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xl">💊</span>
            <h3 className="font-black text-lg text-gray-900">{match.query}</h3>
            <Badge type="none" />
          </div>
        </div>
        <div className="p-6 text-center text-gray-500 font-semibold">
          {match.error || "No alternatives found in database."}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-md overflow-hidden mb-6">
      <div className="px-6 py-4 bg-gray-50 border-b-2 border-gray-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xl">💊</span>
          <h3 className="font-black text-lg text-gray-900">
            {match.matched_brand || match.query}
          </h3>
          <Badge type={match.match_type} score={match.fuzzy_score} />
        </div>
      </div>

      {match.salt_composition && (
        <div className="px-6 py-3 bg-blue-50 border-b border-gray-200 text-sm text-blue-800 font-semibold">
          🧪 Active Ingredient:{" "}
          <span className="font-extrabold">{match.salt_composition}</span>
        </div>
      )}

      {alts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  Option
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  Generic Name
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  Manufacturer
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  Form
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  Price/Unit
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                  Savings
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alts.map((alt, i) => (
                <AlternativeRow key={`${alt.brand_name}-${i}`} alt={alt} index={i} isWeb={!alt.price_available} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {best && best.price_available && (
        <div className="mx-5 mb-5 mt-2 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl p-4 flex items-center gap-4 text-white">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-xl shrink-0">
            🏆
          </div>
          <div>
            <div className="font-black text-sm">
              Best Deal: {best.brand_name} @ {rupee(best.brand_price)}/unit
            </div>
            <div className="text-xs opacity-90 mt-0.5">
              You save {rupee(best.savings_vs_brand)} ({best.savings_pct.toFixed(0)}
              %) compared to branded medicine
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SummaryCards({ results }: { results: MedicineMatch[] }) {
  const found = results.filter((r) => r.match_type !== "none" && !r.error);
  const priced = found.filter((r) =>
    (r.alternatives || []).some((a) => a.price_available)
  );

  let original = 0;
  let cheapest = 0;
  priced.forEach((r) => {
    const alts = (r.alternatives || []).filter((a) => a.price_available);
    if (!alts.length) return;
    cheapest += alts[0].brand_price;
    const matched = alts.find(
      (a) => a.brand_name.toLowerCase() === (r.matched_brand || "").toLowerCase()
    );
    original += matched
      ? matched.brand_price
      : Math.max(...alts.map((a) => a.brand_price));
  });

  const saved = Math.max(0, original - cheapest);
  const pct = original > 0 ? (saved / original) * 100 : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard value={String(found.length)} label="Medicines Found" color="blue" />
      <StatCard value={`₹${original.toFixed(0)}`} label="Branded Price" color="orange" />
      <StatCard value={`₹${cheapest.toFixed(0)}`} label="Generic Price" color="green" />
      <StatCard
        value={`₹${saved.toFixed(0)}`}
        label={`You Save (${pct.toFixed(0)}%)`}
        color="save"
      />
    </div>
  );
}

function StatCard({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  const styles: Record<string, string> = {
    blue: "text-blue-600",
    orange: "text-orange-600",
    green: "text-emerald-700",
    save: "text-emerald-700 bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-300",
  };

  return (
    <div
      className={`bg-white rounded-2xl border-2 border-gray-200 p-5 text-center shadow-md hover:-translate-y-0.5 transition-transform ${
        color === "save" ? styles.save : ""
      }`}
    >
      <div className={`text-2xl font-black ${styles[color] || "text-gray-900"}`}>
        {value}
      </div>
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">
        {label}
      </div>
    </div>
  );
}
