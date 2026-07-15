import { NextResponse } from "next/server";

// Enrichment feature has been removed from this installation.
export async function POST() {
  return NextResponse.json({ error: "Enrichment is not available" }, { status: 410 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Enrichment is not available" }, { status: 410 });
}
