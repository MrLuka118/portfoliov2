import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * Stanje QR prijavne zahteve (javno – računalnik to poizveduje vsako sekundo).
 * Vrne: "pending" | "approved" | "expired".
 */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ status: "expired" });
  }

  const row = await prisma.loginRequest.findUnique({ where: { token } });
  if (!row || row.consumed || row.expiresAt < new Date()) {
    return NextResponse.json({ status: "expired" });
  }

  return NextResponse.json({ status: row.approved ? "approved" : "pending" });
}
