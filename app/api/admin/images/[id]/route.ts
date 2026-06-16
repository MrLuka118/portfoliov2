import { NextResponse } from "next/server";
import { del } from "@vercel/blob";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Izbriši posamezno sliko (datoteko v Blob + zapis v bazi).
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ni dovoljenja." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) {
      return NextResponse.json({ error: "Slika ne obstaja." }, { status: 404 });
    }

    if (image.imageUrl.includes("blob.vercel-storage.com")) {
      await del(image.imageUrl).catch((e) =>
        console.error("Napaka pri brisanju Blob datoteke:", e)
      );
    }

    await prisma.image.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/images/[id]:", error);
    return NextResponse.json(
      { error: "Napaka pri brisanju slike." },
      { status: 500 }
    );
  }
}
