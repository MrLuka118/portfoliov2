import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import QRCode from "qrcode";

import { prisma } from "@/lib/prisma";

// Kako dolgo je QR zahteva veljavna (2 minuti).
const TTL_MS = 2 * 60 * 1000;

/**
 * Ustvari novo QR prijavno zahtevo (javno – brez seje).
 * Vrne token (za polling) in QR kodo, ki kaže na potrditveno stran.
 * Zahteva sama po sebi ne da dostopa: odobriti jo more prijavljena naprava.
 */
export async function POST(req: Request) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TTL_MS);

  await prisma.loginRequest.create({
    data: { token, expiresAt },
  });

  // Potrditveni URL gradimo iz gostitelja zahteve, da deluje tudi prek
  // omrežnega IP-ja (telefon na istem Wi-Fi) ali pravega produkcijskega URL-ja.
  const origin = new URL(req.url).origin;
  const approveUrl = `${origin}/admin/approve?token=${token}`;
  const qr = await QRCode.toDataURL(approveUrl, { margin: 1, width: 240 });

  return NextResponse.json({ token, qr, expiresInMs: TTL_MS });
}
