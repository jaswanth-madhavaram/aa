"use client";

import { useState, useEffect } from "react";

interface Medicine {
  id: number;
  brand_name: string;
  generic_name: string;
  salt_composition: string;
  manufacturer: string;
  brand_price_per_unit: number;
  generic_price_per_unit: number;
  jan_aushadhi_price: number | null;
  category: string;
  strength: string;
  form: string;
}

export default function BrowsePage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/medicines/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "100" });
    if (activeCategory) params.set("category", activeCategory);
    if (searchQ) params.set("q", searchQ);

    fetch(`/api/medicines?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setMedicines(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeCategory, searchQ]);

  function rupee(val: number) {
    return `₹${val.toFixed(2)}`;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">
        📋 Medicine Database
      </h1>
      <p className="text-sm text-gray-500 font-semibold mb-6">
        Browse 700+ medicines with brand vs generic price comparisons
      </p>

      {/* Search + Category Tabs */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="Filter by name, generic, or salt..."
          className="w-full max-w-md px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold focus:border-emerald-500 outline-none transition-colors mb-4"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("")}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
              !activeCategory
                ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30"
                : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300"
            }`}
          >
            All
          </button>
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                activeCategory === cat
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30"
                  : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-md overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500 font-bold">
            <div className="text-4xl mb-3">📚</div>
            Loading medicines...
          </div>
        ) : medicines.length === 0 ? (
          <div className="p-10 text-center text-gray-500 font-bold">
            No medicines found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    Brand
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    Generic
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500 hidden lg:table-cell">
                    Salt
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    Brand ₹
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    Generic ₹
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    Savings
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {medicines.map((m) => {
                  const savings = m.brand_price_per_unit - m.generic_price_per_unit;
                  const pct =
                    m.brand_price_per_unit > 0
                      ? (savings / m.brand_price_per_unit) * 100
                      : 0;
                  return (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-extrabold text-gray-900 text-sm">
                          {m.brand_name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {m.generic_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                        {m.salt_composition}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                          {m.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-extrabold text-orange-600 text-sm">
                          {rupee(m.brand_price_per_unit)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-extrabold text-emerald-700 text-sm">
                          {rupee(m.generic_price_per_unit)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-700">
                          {pct.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
