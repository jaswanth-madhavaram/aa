import Tesseract from "tesseract.js";

export interface OCRResult {
  text: string;
  engine: string;
  confidence: number;
  lines: { text: string; confidence: number }[];
  error: string | null;
}

export async function extractTextFromImage(
  imageBytes: Buffer,
  mimeType: string
): Promise<OCRResult> {
  // Try Gemini Vision first if API key is available (higher quality for handwriting)
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (apiKey) {
    const geminiResult = await tryGeminiVision(imageBytes, mimeType, apiKey);
    if (geminiResult.text) return geminiResult;
  }

  // Fallback: Tesseract.js — pure JS, works everywhere including Vercel
  return tryTesseract(imageBytes);
}

async function tryTesseract(imageBytes: Buffer): Promise<OCRResult> {
  try {
    const {
      data: { text, confidence },
    } = await Tesseract.recognize(imageBytes, "eng", {
      logger: () => {},
    });

    if (!text || !text.trim()) {
      return {
        text: "",
        engine: "tesseract.js",
        confidence: 0,
        lines: [],
        error:
          "No text could be extracted. Try a clearer, well-lit photo of the prescription.",
      };
    }

    const cleanedLines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const avgConf = Math.round(confidence);

    return {
      text: cleanedLines.join("\n"),
      engine: "tesseract.js",
      confidence: avgConf,
      lines: cleanedLines.map((l) => ({ text: l, confidence: avgConf })),
      error: null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      text: "",
      engine: "tesseract.js",
      confidence: 0,
      lines: [],
      error: `OCR failed: ${msg}`,
    };
  }
}

async function tryGeminiVision(
  imageBytes: Buffer,
  mimeType: string,
  apiKey: string
): Promise<OCRResult> {
  try {
    const b64 = imageBytes.toString("base64");
    const mediaType = mimeType.startsWith("image/") ? mimeType : "image/jpeg";
    const model = process.env.MEDICO_VISION_MODEL || "gemini-2.5-flash";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: "Transcribe this medical prescription image. Extract ALL medicine names, their dosages, forms (tablet/capsule/syrup etc), and instructions. Preserve line breaks. Output ONLY the transcribed text; no commentary, no medical advice, no formatting instructions.",
                },
                {
                  inline_data: {
                    mime_type: mediaType,
                    data: b64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 1500,
          },
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini OCR failed with ${res.status}`);
    const payload = await res.json();
    const text = (payload.candidates || [])
      .flatMap((candidate: { content?: { parts?: { text?: string }[] } }) =>
        candidate.content?.parts || []
      )
      .map((part: { text?: string }) => part.text || "")
      .filter(Boolean)
      .join("\n");

    const cleanedLines = text
      .split("\n")
      .map((l: string) => l.trim())
      .filter(Boolean);

    return {
      text: cleanedLines.join("\n"),
      engine: "gemini-vision",
      confidence: 92,
      lines: cleanedLines.map((l: string) => ({ text: l, confidence: 92 })),
      error: null,
    };
  } catch {
    return {
      text: "",
      engine: "gemini-vision",
      confidence: 0,
      lines: [],
      error: null,
    };
  }
}
