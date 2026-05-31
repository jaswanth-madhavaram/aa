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
  // Try Claude Vision first if API key is available (higher quality for handwriting)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    const claudeResult = await tryClaudeVision(imageBytes, mimeType, apiKey);
    if (claudeResult.text) return claudeResult;
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

async function tryClaudeVision(
  imageBytes: Buffer,
  mimeType: string,
  apiKey: string
): Promise<OCRResult> {
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });
    const b64 = imageBytes.toString("base64");
    const mediaType = (
      mimeType.startsWith("image/") ? mimeType : "image/jpeg"
    ) as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

    const message = await client.messages.create({
      model: process.env.MEDICO_VISION_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: b64 },
            },
            {
              type: "text",
              text: "Transcribe this medical prescription image. Extract ALL medicine names, their dosages, forms (tablet/capsule/syrup etc), and instructions. Preserve line breaks. Output ONLY the transcribed text — no commentary, no medical advice, no formatting instructions.",
            },
          ],
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    const cleanedLines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    return {
      text: cleanedLines.join("\n"),
      engine: "claude-vision",
      confidence: 92,
      lines: cleanedLines.map((l) => ({ text: l, confidence: 92 })),
      error: null,
    };
  } catch {
    return {
      text: "",
      engine: "claude-vision",
      confidence: 0,
      lines: [],
      error: null,
    };
  }
}
