import { NextRequest, NextResponse } from "next/server";
import { extractTextFromImage } from "@/lib/ocr";
import { extractMedicines } from "@/lib/nlp";
import { bulkFindAlternatives } from "@/lib/matcher";
import { addSearchHistory } from "@/lib/db";

export const maxDuration = 60;
import { randomUUID } from "crypto";

const MAX_SIZE = 10 * 1024 * 1024;

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

    const medicineDetails = extractMedicines(ocrResult.text);
    const medicineNames = medicineDetails.map((m) => m.name);
    const matches = bulkFindAlternatives(medicineNames);

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
