import { NextResponse } from "next/server";
import QRCode from "qrcode";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateTotpSecret, totpAuthUri } from "@/lib/totp";

/**
 * Začne vpis nove 2FA naprave: ustvari novo skrivnost in vrne QR kodo.
 * Skrivnost se NE shrani v bazo, dokler je uporabnik ne potrdi prek /enable.
 */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ni dovoljenja." }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : null;
  if (!user) {
    return NextResponse.json({ error: "Uporabnik ne obstaja." }, { status: 404 });
  }

  const secret = generateTotpSecret();
  const label = user.email ?? user.username;
  const uri = totpAuthUri(secret, label);
  const qr = await QRCode.toDataURL(uri, { margin: 1, width: 240 });

  return NextResponse.json({ secret, qr });
}
