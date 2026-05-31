import path from "path";
import fs from "fs";

export interface MedicineRow {
  id: number;
  brand_name: string;
  generic_name: string;
  salt_composition: string;
  manufacturer: string;
  brand_price_per_unit: number;
  unit_type: string;
  generic_price_per_unit: number;
  jan_aushadhi_price: number | null;
  category: string;
  strength: string;
  form: string;
}

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

let _medicines: MedicineRow[] | null = null;
let _users: UserRow[] = [];
let _nextUserId = 1;

function loadMedicines(): MedicineRow[] {
  if (_medicines) return _medicines;

  const csvPath = path.join(process.cwd(), "src", "data", "medicines.csv");
  if (!fs.existsSync(csvPath)) {
    console.warn("[DB] medicines.csv not found at", csvPath);
    _medicines = [];
    return _medicines;
  }

  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.split("\n").filter((l) => l.trim());
  const meds: MedicineRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 11) continue;
    meds.push({
      id: i,
      brand_name: cols[0].trim(),
      generic_name: cols[1].trim(),
      salt_composition: cols[2].trim(),
      manufacturer: cols[3].trim(),
      brand_price_per_unit: parseFloat(cols[4]) || 0,
      unit_type: cols[5].trim(),
      generic_price_per_unit: parseFloat(cols[6]) || 0,
      jan_aushadhi_price: cols[7].trim() ? parseFloat(cols[7]) : null,
      category: cols[8].trim(),
      strength: cols[9].trim(),
      form: cols[10].trim(),
    });
  }

  _medicines = meds;
  console.log(`[DB] Loaded ${meds.length} medicines from CSV`);
  return _medicines;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Medicine queries
export function getAllMedicines(): MedicineRow[] {
  return loadMedicines();
}

export function getMedicineCount(): number {
  return loadMedicines().length;
}

export function findMedicineByBrand(name: string): MedicineRow | undefined {
  return loadMedicines().find(
    (m) => m.brand_name.toLowerCase() === name.toLowerCase()
  );
}

export function findMedicinesByGeneric(genericName: string): MedicineRow[] {
  return loadMedicines().filter(
    (m) => m.generic_name.toLowerCase() === genericName.toLowerCase()
  );
}

export function findMedicinesBySalt(
  salt: string,
  form: string
): MedicineRow[] {
  return loadMedicines().filter(
    (m) =>
      m.salt_composition.toLowerCase() === salt.toLowerCase() &&
      m.form.toLowerCase() === form.toLowerCase()
  );
}

export function findMedicinesByGenericStrengthForm(
  generic: string,
  strength: string,
  form: string
): MedicineRow[] {
  return loadMedicines().filter(
    (m) =>
      m.generic_name.toLowerCase() === generic.toLowerCase() &&
      m.strength.toLowerCase() === strength.toLowerCase() &&
      m.form.toLowerCase() === form.toLowerCase()
  );
}

export function searchMedicines(
  q?: string,
  category?: string,
  skip = 0,
  limit = 50
): MedicineRow[] {
  let results = loadMedicines();

  if (q) {
    const lower = q.toLowerCase();
    results = results.filter(
      (m) =>
        m.brand_name.toLowerCase().includes(lower) ||
        m.generic_name.toLowerCase().includes(lower) ||
        m.salt_composition.toLowerCase().includes(lower)
    );
  }

  if (category) {
    const lower = category.toLowerCase();
    results = results.filter((m) =>
      m.category.toLowerCase().includes(lower)
    );
  }

  return results.slice(skip, skip + limit);
}

export function findMedicineByBrandPrefix(prefix: string): MedicineRow | undefined {
  const lower = prefix.toLowerCase();
  return loadMedicines().find(
    (m) => m.brand_name.toLowerCase().startsWith(lower)
  );
}

export function getAllBrandNames(): string[] {
  const seen = new Set<string>();
  return loadMedicines()
    .map((m) => m.brand_name)
    .filter((name) => {
      const key = name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function getAllGenericNames(): string[] {
  const seen = new Set<string>();
  return loadMedicines()
    .map((m) => m.generic_name)
    .filter((name) => {
      const key = name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function getCategories(): string[] {
  const seen = new Set<string>();
  return loadMedicines()
    .map((m) => m.category)
    .filter((cat) => {
      if (!cat || seen.has(cat)) return false;
      seen.add(cat);
      return true;
    })
    .sort();
}

// User queries (in-memory for serverless — use a real DB in production)
export function findUserByEmail(email: string): UserRow | undefined {
  return _users.find((u) => u.email === email.toLowerCase());
}

export function createUserRow(
  name: string,
  email: string,
  passwordHash: string
): UserRow {
  const existing = findUserByEmail(email);
  if (existing) throw new Error("An account already exists for this email.");

  const user: UserRow = {
    id: _nextUserId++,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  };
  _users.push(user);
  return user;
}

// Search history (non-critical, in-memory)
export function addSearchHistory(medicines: string, sessionId: string) {
  // In a production app, this would persist to a database
}
