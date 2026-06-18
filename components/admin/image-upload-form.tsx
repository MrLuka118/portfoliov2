"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";
import { upload } from "@vercel/blob/client";

import type { CategoryDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Prebere dimenzije slike na klientu (za masonry razmerja). */
function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

/** Obrazec za nalaganje slike: naslov v 3 jezikih + izbira kategorije. */
export function ImageUploadForm({ categories }: { categories: CategoryDTO[] }) {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [titleSl, setTitleSl] = React.useState("");
  const [titleHr, setTitleHr] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  function reset() {
    setFile(null);
    setPreview(null);
    setTitleSl("");
    setTitleHr("");
    setTitleEn("");
    setCategoryId("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return toast.error("Izberi datoteko slike.");
    if (!categoryId) return toast.error("Izberi kategorijo.");

    setLoading(true);
    try {
      const { width, height } = await readDimensions(file);
      const category = categories.find((c) => c.id === categoryId);
      const pathname = `portfolio/${category?.slug ?? "misc"}/${file.name}`;

      // 1) Direkten upload v Vercel Blob (zaobide ~4.5 MB omejitev serverless funkcij).
      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
        contentType: file.type,
      });

      // 2) Shrani metapodatke v bazo (majhen JSON).
      const res = await fetch("/api/admin/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: blob.url,
          title_sl: titleSl,
          title_hr: titleHr,
          title_en: titleEn,
          category_id: categoryId,
          width,
          height,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Napaka pri shranjevanju (${res.status}).`);
      }

      toast.success("Slika naložena.");
      reset();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Napaka pri nalaganju.");
    } finally {
      setLoading(false);
    }
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Najprej ustvari vsaj eno kategorijo v zavihku »Kategorije«.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 md:grid-cols-2">
      {/* Leva stran: datoteka + predogled */}
      <div className="space-y-3">
        <Label htmlFor="file">Slika</Label>
        <label
          htmlFor="file"
          className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-card/50 transition-colors hover:border-accent/60"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Predogled"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex flex-col items-center gap-2 text-muted-foreground">
              <UploadCloud className="h-8 w-8" />
              <span className="text-sm">Klikni za izbiro slike</span>
              <span className="text-xs">JPEG · PNG · WebP · AVIF (do 8 MB)</span>
            </span>
          )}
        </label>
        <Input
          id="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* Desna stran: naslovi + kategorija */}
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title_sl">Naslov (SLO)</Label>
          <Input
            id="title_sl"
            value={titleSl}
            onChange={(e) => setTitleSl(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title_hr">Naslov (HR)</Label>
          <Input
            id="title_hr"
            value={titleHr}
            onChange={(e) => setTitleHr(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="title_en">Naslov (EN)</Label>
          <Input
            id="title_en"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Kategorija</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Izberi kategorijo" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.title_sl}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" variant="accent" disabled={loading} className="w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Naloži sliko
        </Button>
      </div>
    </form>
  );
}
