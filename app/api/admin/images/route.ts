import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { getAllImages } from "@/lib/data";

// Seznam vseh slik (admin pregled).
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Ni dovoljenja." }, { status: 401 });
  }
  const images = await getAllImages();
  return NextResponse.json({ images });
}
