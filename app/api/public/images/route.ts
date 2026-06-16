import { NextResponse } from "next/server";

import { getAllImages } from "@/lib/data";

// Javni endpoint: vse slike (vsa tri jezikovna polja).
export async function GET() {
  try {
    const images = await getAllImages();
    return NextResponse.json({ images });
  } catch (error) {
    console.error("GET /api/public/images:", error);
    return NextResponse.json(
      { error: "Napaka pri pridobivanju slik." },
      { status: 500 }
    );
  }
}
