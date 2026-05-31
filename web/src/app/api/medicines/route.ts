import { NextRequest, NextResponse } from "next/server";
import { searchMedicines } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const category = req.nextUrl.searchParams.get("category") || "";
  const skip = parseInt(req.nextUrl.searchParams.get("skip") || "0");
  const limit = Math.min(
    parseInt(req.nextUrl.searchParams.get("limit") || "50"),
    200
  );

  const medicines = searchMedicines(q || undefined, category || undefined, skip, limit);
  return NextResponse.json(medicines);
}
