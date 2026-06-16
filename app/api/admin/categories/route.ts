import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { getCategories } from "@/lib/data";

// Seznam kategorij (admin).
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ni dovoljenja." }, { status: 401 });
  }
  const categories = await getCategories();
  return NextResponse.json({ categories });
}

// Ustvari novo kategorijo (naslov v treh jezikih).
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ni dovoljenja." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const titleSl = String(body.title_sl ?? "").trim();
    const titleHr = String(body.title_hr ?? "").trim();
    const titleEn = String(body.title_en ?? "").trim();

    if (!titleSl || !titleHr || !titleEn) {
      return NextResponse.json(
        { error: "Vsi trije jezikovni naslovi so obvezni." },
        { status: 400 }
      );
    }

    // Ustvari edinstven slug iz angleškega naslova (anchor sekcije).
    let baseSlug = slugify(titleEn) || slugify(titleSl) || "kategorija";
    let slug = baseSlug;
    let i = 1;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`;
    }

    // Postavi novo kategorijo na konec.
    const last = await prisma.category.findFirst({
      orderBy: { position: "desc" },
    });

    const category = await prisma.category.create({
      data: {
        slug,
        titleSl,
        titleHr,
        titleEn,
        position: (last?.position ?? 0) + 1,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/categories:", error);
    return NextResponse.json(
      { error: "Napaka pri ustvarjanju kategorije." },
      { status: 500 }
    );
  }
}
