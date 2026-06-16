import { NextResponse } from "next/server";
import { del, put } from "@vercel/blob";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IMAGE_SETTING_KEYS } from "@/lib/data";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 12 * 1024 * 1024;

// Naloži / zamenja sliko strani (naslovna hero ali About portret) prek admina.
// Ključ določa, katera nastavitev se posodobi (allowlist v IMAGE_SETTING_KEYS).
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
    const key = String(form.get("key") ?? "");
    const folder = IMAGE_SETTING_KEYS[key];

    if (!folder) {
      return NextResponse.json({ error: "Neveljaven ključ slike." }, { status: 400 });
    }
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

    const blob = await put(`${folder}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Pobriši staro datoteko, če je bila na Blobu.
    const previous = await prisma.setting.findUnique({ where: { key } });
    if (previous?.value.includes("blob.vercel-storage.com")) {
      await del(previous.value).catch((e) =>
        console.error("Napaka pri brisanju stare datoteke:", e)
      );
    }

    await prisma.setting.upsert({
      where: { key },
      update: { value: blob.url },
      create: { key, value: blob.url },
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("POST /api/admin/site-image:", error);
    return NextResponse.json(
      { error: "Napaka pri nalaganju slike." },
      { status: 500 }
    );
  }
}

// Ponastavi sliko strani na privzeto (izbriše nastavitev in Blob datoteko).
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ni dovoljenja." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") ?? "";
    if (!IMAGE_SETTING_KEYS[key]) {
      return NextResponse.json({ error: "Neveljaven ključ slike." }, { status: 400 });
    }

    const previous = await prisma.setting.findUnique({ where: { key } });
    if (previous?.value.includes("blob.vercel-storage.com")) {
      await del(previous.value).catch(() => {});
    }
    await prisma.setting.delete({ where: { key } }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/site-image:", error);
    return NextResponse.json(
      { error: "Napaka pri ponastavitvi." },
      { status: 500 }
    );
  }
}
