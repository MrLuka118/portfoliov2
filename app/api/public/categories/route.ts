import { NextResponse } from "next/server";

import { getCategoriesWithImages } from "@/lib/data";

// Javni endpoint: kategorije s slikami (vsa tri jezikovna polja naenkrat).
export async function GET() {
  try {
    const categories = await getCategoriesWithImages();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/public/categories:", error);
    return NextResponse.json(
      { error: "Napaka pri pridobivanju kategorij." },
      { status: 500 }
    );
  }
}
