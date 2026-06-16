import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Dovoljeni tipi in največja velikost datoteke (8 MB).
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 8 * 1024 * 1024;

// Naloži sliko v Vercel Blob in shrani zapis (naslov v 3 jezikih + URL) v bazo.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ni dovoljenja." }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Manjka BLOB_READ_WRITE_TOKEN. Nastavi Vercel Blob storage." },
      { status: 500 }
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const titleSl = String(form.get("title_sl") ?? "").trim();
    const titleHr = String(form.get("title_hr") ?? "").trim();
    const titleEn = String(form.get("title_en") ?? "").trim();
    const categoryId = String(form.get("category_id") ?? "").trim();
    const width = Number(form.get("width")) || null;
    const height = Number(form.get("height")) || null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Manjka datoteka." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Nepodprt format slike (dovoljeni: JPEG, PNG, WebP, AVIF)." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Datoteka je prevelika (največ 8 MB)." },
        { status: 400 }
      );
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

    // Naloži v Blob z naključno končnico, da ne pride do prepisa.
    const blob = await put(`portfolio/${category.slug}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    const image = await prisma.image.create({
      data: {
        titleSl,
        titleHr,
        titleEn,
        imageUrl: blob.url,
        width,
        height,
        categoryId,
      },
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/upload:", error);
    // Začasno: vrni dejansko sporočilo napake za lažjo diagnozo.
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Napaka pri nalaganju slike: ${detail}` },
      { status: 500 }
    );
  }
}
