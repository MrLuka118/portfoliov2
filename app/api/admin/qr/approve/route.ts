import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Odobri QR prijavno zahtevo z zaupanja vredne (že prijavljene) naprave.
 * Veže zahtevo na trenutnega uporabnika; računalnik jo nato unovči ob prijavi.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ni dovoljenja." }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "Ni dovoljenja." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const token = String(body?.token ?? "").trim();
  if (!token) {
    return NextResponse.json({ error: "Manjka token." }, { status: 400 });
  }

  const row = await prisma.loginRequest.findUnique({ where: { token } });
  if (!row || row.consumed || row.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Zahteva je potekla. Osveži QR kodo na računalniku." },
      { status: 400 }
    );
  }

  await prisma.loginRequest.update({
    where: { id: row.id },
    data: { approved: true, userId },
  });

  return NextResponse.json({ ok: true });
}
