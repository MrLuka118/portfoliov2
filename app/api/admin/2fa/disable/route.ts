import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTotp } from "@/lib/totp";

/**
 * Izklopi 2FA. Za varnost zahteva veljavno trenutno kodo,
 * da nihče z odprto sejo ne more kar tako odstraniti zaščite.
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

  if (!user.totpSecret) {
    return NextResponse.json({ ok: true }); // že izklopljeno
  }

  const body = await req.json().catch(() => null);
  const code = String(body?.code ?? "").trim();

  if (!verifyTotp(user.totpSecret, code, user.email ?? undefined)) {
    return NextResponse.json(
      { error: "Napačna koda. 2FA ni izklopljen." },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: null },
  });

  return NextResponse.json({ ok: true });
}
