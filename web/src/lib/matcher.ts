import {
  MedicineRow,
  findMedicineByBrand,
  findMedicineByBrandPrefix,
  findMedicinesByGeneric,
  findMedicinesByGenericStrengthForm,
  findMedicinesBySalt,
  getAllBrandNames,
  getAllGenericNames,
} from "./db";
import Fuse from "fuse.js";

export interface Alternative {
  brand_name: string;
  generic_name: string;
  salt_composition: string;
  manufacturer: string;
  brand_price: number;
  generic_price: number;
  jan_aushadhi_price: number | null;
  unit_type: string;
  category: string;
  strength: string;
  form: string;
  savings_vs_brand: number;
  savings_pct: number;
  source: string;
  price_available: boolean;
}

export interface MedicineMatch {
  query: string;
  matched_brand: string | null;
  salt_composition: string | null;
  match_type: "exact" | "fuzzy" | "salt" | "none";
  fuzzy_score: number;
  alternatives: Alternative[];
  error: string | null;
}

export function findAlternatives(name: string, topN = 5): MedicineMatch {
  const result: MedicineMatch = {
    query: name,
    matched_brand: null,
    salt_composition: null,
    match_type: "none",
    fuzzy_score: 0,
    alternatives: [],
    error: null,
  };

  if (!name || !name.trim()) {
    result.error = "Empty medicine name";
    return result;
  }

  // 1. Exact brand match
  const exact = findMedicineByBrand(name.trim());
  if (exact) {
    result.matched_brand = exact.brand_name;
    result.salt_composition = exact.salt_composition;
    result.match_type = "exact";
    result.fuzzy_score = 100;
    result.alternatives = getAlternativesBySalt(exact, topN);
    return result;
  }

  // 1b. Prefix brand match (e.g. "Dolo" matches "Dolo 650")
  const prefix = findMedicineByBrandPrefix(name.trim());
  if (prefix) {
    result.matched_brand = prefix.brand_name;
    result.salt_composition = prefix.salt_composition;
    result.match_type = "exact";
    result.fuzzy_score = 95;
    result.alternatives = getAlternativesBySalt(prefix, topN);
    return result;
  }

  // 2. Fuzzy brand match
  const allBrands = getAllBrandNames().map((b) => ({ name: b }));
  const fuseBrand = new Fuse(allBrands, {
    keys: ["name"],
    threshold: 0.4,
    includeScore: true,
  });

  const fuzzyResults = fuseBrand.search(name);
  if (fuzzyResults.length > 0 && fuzzyResults[0].score !== undefined) {
    const matched = fuzzyResults[0].item.name;
    const score = Math.round((1 - fuzzyResults[0].score) * 100);

    if (score >= 60) {
      const dbMed = findMedicineByBrand(matched);
      if (dbMed) {
        result.matched_brand = dbMed.brand_name;
        result.salt_composition = dbMed.salt_composition;
        result.match_type = "fuzzy";
        result.fuzzy_score = score;
        result.alternatives = getAlternativesBySalt(dbMed, topN);
        return result;
      }
    }
  }

  // 3. Generic/salt name match
  const allGenerics = getAllGenericNames().map((g) => ({ name: g }));
  const fuseGeneric = new Fuse(allGenerics, {
    keys: ["name"],
    threshold: 0.4,
    includeScore: true,
  });

  const genericResults = fuseGeneric.search(name);
  if (genericResults.length > 0 && genericResults[0].score !== undefined) {
    const matchedGeneric = genericResults[0].item.name;
    const score = Math.round((1 - genericResults[0].score) * 100);

    if (score >= 60) {
      const meds = findMedicinesByGenericStrengthForm(matchedGeneric, "", "");
      const dbMed =
        meds.length > 0
          ? meds.reduce((a, b) =>
              a.brand_price_per_unit > b.brand_price_per_unit ? a : b
            )
          : undefined;

      if (!dbMed) {
        const broader = findMedicinesByGeneric(matchedGeneric);
        if (broader.length > 0) {
          const best = broader.reduce((a, b) =>
            a.brand_price_per_unit > b.brand_price_per_unit ? a : b
          );
          result.matched_brand = best.brand_name;
          result.salt_composition = best.salt_composition;
          result.match_type = "salt";
          result.fuzzy_score = score;
          result.alternatives = getAlternativesBySalt(best, topN);
          return result;
        }
      }

      if (dbMed) {
        result.matched_brand = dbMed.brand_name;
        result.salt_composition = dbMed.salt_composition;
        result.match_type = "salt";
        result.fuzzy_score = score;
        result.alternatives = getAlternativesBySalt(dbMed, topN);
        return result;
      }
    }
  }

  result.error = `No match found for '${name}'`;
  return result;
}

function getAlternativesBySalt(ref: MedicineRow, topN: number): Alternative[] {
  let sameSalt = findMedicinesByGenericStrengthForm(
    ref.generic_name,
    ref.strength,
    ref.form
  );

  if (sameSalt.length === 0) {
    sameSalt = findMedicinesBySalt(ref.salt_composition, ref.form);
  }

  const refPrice = ref.brand_price_per_unit;

  const alts: Alternative[] = sameSalt.map((med) => {
    const savings = Math.max(0, refPrice - med.brand_price_per_unit);
    const savingsPct = refPrice > 0 ? (savings / refPrice) * 100 : 0;
    return {
      brand_name: med.brand_name,
      generic_name: med.generic_name,
      salt_composition: med.salt_composition,
      manufacturer: med.manufacturer,
      brand_price: med.brand_price_per_unit,
      generic_price: med.generic_price_per_unit,
      jan_aushadhi_price: med.jan_aushadhi_price,
      unit_type: med.unit_type,
      category: med.category,
      strength: med.strength,
      form: med.form,
      savings_vs_brand: Math.round(savings * 100) / 100,
      savings_pct: Math.round(savingsPct * 10) / 10,
      source: "local_db",
      price_available: true,
    };
  });

  // Add generic formulation
  const genericSavings = Math.max(0, refPrice - ref.generic_price_per_unit);
  const genericPct = refPrice > 0 ? (genericSavings / refPrice) * 100 : 0;
  alts.push({
    brand_name: "Generic Formulation",
    generic_name: ref.generic_name,
    salt_composition: ref.salt_composition,
    manufacturer: "Various Manufacturers",
    brand_price: ref.generic_price_per_unit,
    generic_price: ref.generic_price_per_unit,
    jan_aushadhi_price: ref.jan_aushadhi_price,
    unit_type: ref.unit_type,
    category: ref.category,
    strength: ref.strength,
    form: ref.form,
    savings_vs_brand: Math.round(genericSavings * 100) / 100,
    savings_pct: Math.round(genericPct * 10) / 10,
    source: "generic",
    price_available: true,
  });

  alts.sort((a, b) => a.brand_price - b.brand_price);

  const seen = new Set<string>();
  const unique: Alternative[] = [];
  for (const a of alts) {
    const key = a.brand_name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(a);
    }
  }

  return unique.slice(0, topN);
}

export function bulkFindAlternatives(names: string[]): MedicineMatch[] {
  return names.map((n) => findAlternatives(n));
}
