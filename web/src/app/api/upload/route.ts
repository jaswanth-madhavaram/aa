import { NextRequest, NextResponse } from "next/server";
import { extractTextFromImage } from "@/lib/ocr";
import { extractMedicines } from "@/lib/nlp";
import { bulkFindAlternatives } from "@/lib/matcher";
import { addSearchHistory } from "@/lib/db";

export const maxDuration = 60;
import { randomUUID } from "crypto";

const MAX_SIZE = 10 * 1024 * 1024;
const CANDIDATE_STOPWORDS = new Set([
  "after",
  "before",
  "daily",
  "doctor",
  "food",
  "morning",
  "night",
  "patient",
  "tablet",
  "tablets",
  "take",
]);

function fallbackCandidatesFromOcr(text: string, limit = 24): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  for (const rawLine of text.replace(/\r/g, "\n").split("\n")) {
    const line = rawLine.replace(/\s+/g, " ").trim();
    if (line.length < 3) continue;
    if (/\b(?:doctor|hospital|clinic|patient|age|sex|date|phone|mobile)\b/i.test(line)) {
      continue;
    }

    let working = line.replace(/^\s*(?:rx|r\/|\d+[\).:-]?|[-*])\s*/i, " ");
    working = working.replace(
      /\b(?:tab(?:let)?s?|cap(?:sule)?s?|syp|syr(?:up)?|inj(?:ection)?|susp(?:ension)?|drop(?:s)?|cream|gel)\b\.?\s*/i,
      " "
    );
    working = working.split(
      /\b(?:after|before|daily|morning|night|evening|bd|od|tds|sos|days?|with|without|food|meal)\b/i
    )[0];

    const tokens = (working.match(/[A-Za-z][A-Za-z0-9+-]*|\d{2,4}/g) || [])
      .filter((token) => token.length >= 2 && !CANDIDATE_STOPWORDS.has(token.toLowerCase()));

    for (const size of [3, 2, 1]) {
      for (let start = 0; start <= tokens.length - size; start++) {
        const phrase = tokens.slice(start, start + size).join(" ").trim();
        const key = phrase.toLowerCase().replace(/[^a-z0-9]+/g, "");
        if (key.length < 3 || seen.has(key)) continue;
        seen.add(key);
        candidates.push(phrase);
        if (candidates.length >= limit) return candidates;
      }
    }
  }

  return candidates;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/bmp",
      "image/tiff",
    ];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type '${file.type}'. Upload JPG, PNG, WebP, BMP, or TIFF.`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10 MB)" },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(bytes);
    const ocrResult = await extractTextFromImage(buffer, file.type);

    if (ocrResult.error && !ocrResult.text) {
      return NextResponse.json(
        { error: `OCR failed: ${ocrResult.error}` },
        { status: 422 }
      );
    }

    let medicineDetails = extractMedicines(ocrResult.text);
    let medicineNames = medicineDetails.map((m) => m.name);
    let matches = bulkFindAlternatives(medicineNames);
    if (!matches.some((m) => m.match_type !== "none" && !m.error)) {
      const fallbackMatches = bulkFindAlternatives(
        fallbackCandidatesFromOcr(ocrResult.text)
      ).filter((m) => m.match_type !== "none" && !m.error);
      if (fallbackMatches.length) {
        matches = fallbackMatches;
        medicineDetails = fallbackMatches.map((match) => ({
          name: match.matched_brand || match.query,
          form: null,
          dosage: null,
          sourceLine: match.query,
          confidence: `search-${match.match_type}`,
        }));
        medicineNames = medicineDetails.map((m) => m.name);
      }
    }

    const sessionId = randomUUID();
    addSearchHistory(medicineNames.join(", "), sessionId);

    return NextResponse.json({
      session_id: sessionId,
      raw_text: ocrResult.text,
      ocr_engine: ocrResult.engine,
      ocr_confidence: ocrResult.confidence,
      ocr_lines: ocrResult.lines,
      extracted_medicines: medicineNames,
      extracted_medicine_details: medicineDetails,
      results: matches,
      total_medicines_found: medicineNames.length,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Upload processing failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
