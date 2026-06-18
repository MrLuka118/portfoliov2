import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import { getSession } from "@/lib/auth";

// Dovoljeni tipi in največja velikost datoteke (8 MB).
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 8 * 1024 * 1024;

// Izda kratkoživi token za direkten upload iz brskalnika v Vercel Blob.
// Tako se slika nikoli ne prenese skozi serverless funkcijo, zato ne velja
// Vercelova ~4.5 MB omejitev telesa zahteve (vir napake "Request Entity Too Large").
export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        const session = await getSession();
        if (!session) {
          throw new Error("Ni dovoljenja.");
        }
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          throw new Error(
            "Manjka BLOB_READ_WRITE_TOKEN. Nastavi Vercel Blob storage."
          );
        }
        return {
          allowedContentTypes: ALLOWED,
          maximumSizeInBytes: MAX_SIZE,
          addRandomSuffix: true,
        };
      },
      // Zapis v bazo naredi klient po uspešnem uploadu (POST /api/admin/images),
      // zato tu ni dodatne logike.
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(result);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: detail }, { status: 400 });
  }
}
