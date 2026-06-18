import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { getAllImages } from "@/lib/data";
import { prisma } from "@/lib/prisma";

// Seznam vseh slik (admin pregled).
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ni dovoljenja." }, { status: 401 });
  }
  const images = await getAllImages();
  return NextResponse.json({ images });
}

// Shrani zapis o sliki po uspešnem direktnem uploadu v Vercel Blob.
// Telo je majhen JSON (URL + naslovi + dimenzije), zato ni omejitve velikosti.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ni dovoljenja." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const imageUrl = String(body.imageUrl ?? "").trim();
    const titleSl = String(body.title_sl ?? "").trim();
    const titleHr = String(body.title_hr ?? "").trim();
    const titleEn = String(body.title_en ?? "").trim();
    const categoryId = String(body.category_id ?? "").trim();
    const width = Number(body.width) || null;
    const height = Number(body.height) || null;

    if (!imageUrl) {
      return NextResponse.json({ error: "Manjka URL slike." }, { status: 400 });
    }
    if (!titleSl || !titleHr || !titleEn || !categoryId) {
      return NextResponse.json(
        { error: "Naslovi (3 jeziki) in kategorija so obvezni." },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Izbrana kategorija ne obstaja." },
        { status: 400 }
      );
    }

    const image = await prisma.image.create({
      data: {
        titleSl,
        titleHr,
        titleEn,
        imageUrl,
        width,
        height,
        categoryId,
      },
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/images:", error);
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Napaka pri shranjevanju slike: ${detail}` },
      { status: 500 }
    );
  }
}
