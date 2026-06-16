import { NextResponse } from "next/server";
import { del } from "@vercel/blob";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Izbriši kategorijo (skupaj z njenimi slikami in datotekami v Blob).
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
    const category = await prisma.category.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Kategorija ne obstaja." },
        { status: 404 }
      );
    }

    // Najprej pobriši datoteke iz Vercel Blob (le tiste, ki so na njem).
    const blobUrls = category.images
      .map((img) => img.imageUrl)
      .filter((url) => url.includes("blob.vercel-storage.com"));
    if (blobUrls.length > 0) {
      await del(blobUrls).catch((e) =>
        console.error("Napaka pri brisanju Blob datotek:", e)
      );
    }

    // Kaskadno izbriše tudi slike v bazi (onDelete: Cascade).
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/categories/[id]:", error);
    return NextResponse.json(
      { error: "Napaka pri brisanju kategorije." },
      { status: 500 }
    );
  }
}
