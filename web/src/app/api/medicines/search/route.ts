import { NextRequest, NextResponse } from "next/server";
import { findAlternatives } from "@/lib/matcher";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: "Missing 'name' query parameter" },
      { status: 400 }
    );
  }

  const result = findAlternatives(name.trim());
  return NextResponse.json(result);
}
