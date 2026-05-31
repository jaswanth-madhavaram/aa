import { NextResponse } from "next/server";
import { getMedicineCount } from "@/lib/db";

export async function GET() {
  try {
    const count = getMedicineCount();
    return NextResponse.json({
      status: "ok",
      service: "Medico.AI",
      database: "connected",
      medicines_in_db: count,
    });
  } catch (err: unknown) {
    return NextResponse.json({
      status: "error",
      service: "Medico.AI",
      database: "disconnected",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
