import { NextResponse } from "next/server";
import { del, put } from "@vercel/blob";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SETTING_KEYS } from "@/lib/data";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 12 * 1024 * 1024;

// Naloži / zamenja naslovno (hero) fotografijo prek admina.
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

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Manjka datoteka." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Nepodprt format (dovoljeni: JPEG, PNG, WebP, AVIF)." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Datoteka je prevelika (največ 12 MB)." },
        { status: 400 }
      );
    }

    const blob = await put(`hero/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Pobriši staro hero datoteko, če je bila na Blobu.
    const previous = await prisma.setting.findUnique({
      where: { key: SETTING_KEYS.heroImage },
    });
    if (previous?.value.includes("blob.vercel-storage.com")) {
      await del(previous.value).catch((e) =>
        console.error("Napaka pri brisanju stare hero datoteke:", e)
      );
    }

    await prisma.setting.upsert({
      where: { key: SETTING_KEYS.heroImage },
      update: { value: blob.url },
      create: { key: SETTING_KEYS.heroImage, value: blob.url },
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("POST /api/admin/hero:", error);
    return NextResponse.json(
      { error: "Napaka pri nalaganju naslovne fotografije." },
      { status: 500 }
    );
  }
}

// Ponastavi na privzeto naslovno fotografijo.
export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ni dovoljenja." }, { status: 401 });
  }

  try {
    const previous = await prisma.setting.findUnique({
      where: { key: SETTING_KEYS.heroImage },
    });
    if (previous?.value.includes("blob.vercel-storage.com")) {
      await del(previous.value).catch(() => {});
    }
    await prisma.setting
      .delete({ where: { key: SETTING_KEYS.heroImage } })
      .catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/hero:", error);
    return NextResponse.json(
      { error: "Napaka pri ponastavitvi." },
      { status: 500 }
    );
  }
}
