import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTotp } from "@/lib/totp";

/**
 * Potrdi in vklopi 2FA: preveri kodo proti predlagani skrivnosti
 * in jo (ob uspehu) shrani k uporabniku.
 */
export async function POST(req: Request) {
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

  const body = await req.json().catch(() => null);
  const secret = String(body?.secret ?? "").trim();
  const code = String(body?.code ?? "").trim();

  if (!secret || !code) {
    return NextResponse.json(
      { error: "Manjka skrivnost ali koda." },
      { status: 400 }
    );
  }

  if (!verifyTotp(secret, code, user.email ?? undefined)) {
    return NextResponse.json(
      { error: "Napačna koda. Poskusi znova." },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: secret },
  });

  return NextResponse.json({ ok: true });
}
