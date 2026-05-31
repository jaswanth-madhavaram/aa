import { getAllBrandNames, getAllGenericNames } from "./db";
import Fuse from "fuse.js";

const FORM_PATTERN =
  /\b(tablets?|capsules?|caps?|syrup|syr|syp|injection|inj|suspension|susp|solution|sol|ointment|oint|drops?|cream|gel|spray|lotion|respules?|nebulizer|neb|powder)\b/i;
const DOSAGE_PATTERN =
  /\b\d+(?:\.\d+)?\s*(?:mg|mcg|ml|mL|g|iu|IU|units?|%)\b/i;
const SKIP_LINE =
  /\b(?:date|age|sex|gender|name|address|phone|mobile|dr\.?|doctor|hospital|clinic|patient|diagnosis|weight|height|bp|blood|pressure|signature|follow|review|page|reg(?:istration)?|invoice|bill)\b/i;
const BAD_TOKEN =
  /^(?:tab|tablet|cap|capsule|syp|syrup|inj|injection|take|after|before|daily|night|morning|days|food|dose|no|nil|signature|phone|mobile|age|name|patient|doctor|clinic|hospital|male|female|years?|yrs?|months?|susp|suspension|solution|drops?|cream|gel|spray|lotion|powder|rx|the|and|for|with|per|once|twice|your)$/i;

export interface MedicineDetail {
  name: string;
  form: string | null;
  dosage: string | null;
  sourceLine: string;
  confidence: string;
}

let _fuse: Fuse<{ name: string }> | null = null;
let _knownNames: Set<string> | null = null;

function loadKnownMedicines(): {
  fuse: Fuse<{ name: string }>;
  names: Set<string>;
} {
  if (_fuse && _knownNames) return { fuse: _fuse, names: _knownNames };

  const brands = getAllBrandNames();
  const generics = getAllGenericNames();
  const allNames = [...new Set([...brands, ...generics])];

  const items = allNames
    .filter((n) => n && n.length >= 3)
    .map((n) => ({ name: n }));

  _knownNames = new Set(items.map((i) => i.name.toLowerCase()));
  _fuse = new Fuse(items, {
    keys: ["name"],
    threshold: 0.25,
    includeScore: true,
  });

  return { fuse: _fuse, names: _knownNames };
}

export function extractMedicines(text: string): MedicineDetail[] {
  if (!text || !text.trim()) return [];

  const { fuse, names } = loadKnownMedicines();
  const details: MedicineDetail[] = [];
  const seen = new Set<string>();

  for (const rawLine of text.split("\n")) {
    const line = rawLine.replace(/\s+/g, " ").trim();
    if (!line || line.length < 3 || SKIP_LINE.test(line)) continue;

    const formMatch = line.match(FORM_PATTERN);
    const form = formMatch ? normalizeForm(formMatch[1]) : null;
    const dosageMatch = line.match(DOSAGE_PATTERN);
    const dosage = dosageMatch ? dosageMatch[0].replace(/\s+/g, "") : null;

    const tokens = line
      .replace(/[^A-Za-z0-9+ -]/g, " ")
      .split(/\s+/)
      .filter(
        (t) => t.length >= 3 && !BAD_TOKEN.test(t) && !/^\d+$/.test(t)
      );

    for (const token of tokens) {
      const key = token.toLowerCase();
      if (seen.has(key)) continue;

      if (names.has(key)) {
        seen.add(key);
        details.push({
          name: capitalize(token),
          form,
          dosage,
          sourceLine: line,
          confidence: "exact",
        });
        continue;
      }

      const results = fuse.search(token);
      if (
        results.length > 0 &&
        results[0].score !== undefined &&
        results[0].score < 0.3
      ) {
        const matched = results[0].item.name;
        const matchKey = matched.toLowerCase();
        if (!seen.has(matchKey)) {
          seen.add(matchKey);
          details.push({
            name: matched,
            form,
            dosage,
            sourceLine: line,
            confidence: `fuzzy-${Math.round((1 - results[0].score!) * 100)}`,
          });
        }
      }
    }

    // Multi-word phrases
    const phraseMatch = line.match(
      /\b([A-Z][a-zA-Z]+(?:\s+(?:[A-Z][a-zA-Z]+|\d+))?)\b/
    );
    if (phraseMatch) {
      const phrase = phraseMatch[1].trim();
      const phraseKey = phrase.toLowerCase();
      if (
        !seen.has(phraseKey) &&
        phrase.length >= 3 &&
        !BAD_TOKEN.test(phrase)
      ) {
        if (names.has(phraseKey)) {
          seen.add(phraseKey);
          details.push({
            name: phrase,
            form,
            dosage,
            sourceLine: line,
            confidence: "exact",
          });
        } else {
          const results = fuse.search(phrase);
          if (
            results.length > 0 &&
            results[0].score !== undefined &&
            results[0].score < 0.25
          ) {
            const matched = results[0].item.name;
            const matchKey = matched.toLowerCase();
            if (!seen.has(matchKey)) {
              seen.add(matchKey);
              details.push({
                name: matched,
                form,
                dosage,
                sourceLine: line,
                confidence: `fuzzy-${Math.round(
                  (1 - results[0].score!) * 100
                )}`,
              });
            }
          }
        }
      }
    }
  }

  return details;
}

function normalizeForm(raw: string): string {
  const map: Record<string, string> = {
    tab: "Tablet", tabs: "Tablet", tablet: "Tablet", tablets: "Tablet",
    cap: "Capsule", caps: "Capsule", capsule: "Capsule", capsules: "Capsule",
    syp: "Syrup", syr: "Syrup", syrup: "Syrup",
    inj: "Injection", injection: "Injection",
    susp: "Suspension", suspension: "Suspension",
    sol: "Solution", solution: "Solution",
    oint: "Ointment", ointment: "Ointment",
    drop: "Drops", drops: "Drops",
    cream: "Cream", gel: "Gel", spray: "Spray",
    lotion: "Lotion", powder: "Powder",
    respule: "Respules", respules: "Respules",
    neb: "Nebulizer", nebulizer: "Nebulizer",
  };
  return map[raw.toLowerCase()] || raw;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
