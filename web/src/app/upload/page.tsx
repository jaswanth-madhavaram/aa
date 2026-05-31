"use client";

import { useState, useRef } from "react";
import ResultCard, { SummaryCards } from "@/components/ResultCard";
import type { MedicineMatch } from "@/lib/matcher";

interface UploadResult {
  raw_text: string;
  ocr_engine: string;
  ocr_confidence: number;
  ocr_lines: { text: string; confidence: number }[];
  extracted_medicines: string[];
  extracted_medicine_details: {
    name: string;
    form?: string;
    dosage?: string;
    sourceLine?: string;
    confidence?: string;
  }[];
  results: MedicineMatch[];
  total_medicines_found: number;
}

export default function UploadPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file: File) {
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    setData(null);
    setError(null);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
      if (fileRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileRef.current.files = dt.files;
      }
    }
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please choose a prescription image first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">
        📷 Upload Your Prescription
      </h1>
      <p className="text-sm text-gray-500 font-semibold mb-8">
        Our AI will read your prescription image and find cheaper alternatives
        for all medicines
      </p>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`bg-white rounded-3xl p-10 text-center shadow-md border-3 border-dashed transition-all cursor-pointer ${
          dragOver
            ? "border-emerald-500 bg-emerald-50"
            : "border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/50"
        }`}
        onClick={() => fileRef.current?.click()}
      >
        <div className="text-5xl mb-4">{preview ? "✅" : "🗒️"}</div>
        <h2 className="text-xl font-black text-gray-900 mb-2">
          {preview ? fileName : "Take a Photo or Upload"}
        </h2>
        <p className="text-sm text-gray-500 font-semibold mb-5">
          {preview
            ? "Click Analyse Prescription below to process"
            : "Drag & drop or click to select your prescription image"}
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/bmp,image/tiff"
          onChange={onFileChange}
          className="hidden"
        />
        {!preview && (
          <span className="inline-block bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-6 py-3 rounded-xl font-extrabold text-sm shadow-lg shadow-emerald-500/30">
            Choose File
          </span>
        )}
        <p className="text-xs text-gray-400 mt-4 font-semibold">
          Supports JPG, PNG, WebP, BMP, TIFF &middot; Max 10MB
        </p>
      </div>

      {/* Preview + Scan Panel */}
      {preview && (
        <div className="grid md:grid-cols-2 gap-5 mt-6">
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-md overflow-hidden">
            <img
              src={preview}
              alt="Prescription preview"
              className="w-full max-h-[460px] object-contain bg-gray-100"
            />
          </div>
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-md p-5">
            {data ? (
              <>
                <h3 className="font-extrabold text-lg mb-3">
                  Detected Medicines ({data.total_medicines_found})
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {data.extracted_medicines.map((m, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-extrabold"
                    >
                      💊 {m}
                    </span>
                  ))}
                  {data.extracted_medicines.length === 0 && (
                    <span className="text-sm text-gray-500 font-semibold">
                      No medicines detected
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 font-bold mb-2">
                  OCR: {data.ocr_engine} &middot; Confidence:{" "}
                  {data.ocr_confidence}%
                </div>
                <div className="max-h-48 overflow-y-auto border-t border-gray-200 mt-3 pt-3 space-y-2">
                  {data.ocr_lines.slice(0, 15).map((line, i) => (
                    <div
                      key={i}
                      className="text-sm text-gray-500 border-b border-gray-100 pb-2"
                    >
                      <span className="font-bold text-gray-700">
                        {line.confidence}%
                      </span>{" "}
                      {line.text}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h3 className="font-extrabold text-lg mb-2">Ready to Scan</h3>
                <p className="text-sm text-gray-500 font-semibold">
                  {fileName} &middot;{" "}
                  {fileRef.current?.files?.[0]
                    ? `${(fileRef.current.files[0].size / 1024).toFixed(1)} KB`
                    : ""}
                </p>
                <p className="text-sm text-gray-400 mt-3">
                  Click Analyse Prescription to extract medicine names from this
                  image.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Analyse Button */}
      {preview && (
        <div className="mt-6 text-center">
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-8 py-4 rounded-2xl font-extrabold text-base shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-60"
          >
            {loading ? "Running OCR and AI Analysis..." : "📷 Analyse Prescription"}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mt-6 text-red-700 font-semibold text-center">
          {error}
        </div>
      )}

      {/* Results */}
      {data && data.results && data.results.length > 0 && (
        <div className="mt-8">
          {data.raw_text && (
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-md p-5 mb-6">
              <h3 className="font-extrabold text-lg mb-3">📄 Raw OCR Text</h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-500 font-mono">
                {data.raw_text || "(empty)"}
              </pre>
            </div>
          )}
          <SummaryCards results={data.results} />
          {data.results.map((r, i) => (
            <ResultCard key={i} match={r} />
          ))}
        </div>
      )}

      {/* Security note */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 mt-8 flex gap-3">
        <span className="text-xl shrink-0">🔒</span>
        <p className="text-sm text-amber-800 font-semibold leading-relaxed">
          Your prescription is processed securely. We only extract medicine
          names for comparison. Images are not stored.
        </p>
      </div>
    </div>
  );
}
