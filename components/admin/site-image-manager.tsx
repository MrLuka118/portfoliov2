"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageIcon, Loader2, RotateCcw, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Splošno upravljanje ene slike strani prek admina (npr. naslovna hero ali About portret).
 * `settingKey` določa, katera nastavitev se posodobi.
 */
export function SiteImageManager({
  settingKey,
  title,
  description,
  currentImage,
  aspect = "aspect-[4/3]",
}: {
  settingKey: string;
  title: string;
  description?: string;
  currentImage: string;
  aspect?: string;
}) {
  const router = useRouter();
  const inputId = `file-${settingKey}`;
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function onUpload() {
    if (!file) return toast.error("Izberi datoteko.");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("key", settingKey);
      const res = await fetch("/api/admin/site-image", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Napaka pri nalaganju.");
      toast.success("Slika posodobljena.");
      setFile(null);
      setPreview(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Napaka pri nalaganju.");
    } finally {
      setLoading(false);
    }
  }

  async function onReset() {
    setResetting(true);
    try {
      const res = await fetch(
        `/api/admin/site-image?key=${encodeURIComponent(settingKey)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Napaka pri ponastavitvi.");
      }
      toast.success("Ponastavljeno na privzeto sliko.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Napaka pri ponastavitvi.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card/40 p-6">
      <h3 className="font-serif text-lg">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        {/* Trenutna slika */}
        <div className="space-y-3">
          <Label>Trenutna</Label>
          <div className={`relative ${aspect} overflow-hidden rounded-lg border border-border bg-card`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
          <Button variant="outline" size="sm" onClick={onReset} disabled={resetting}>
            {resetting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            Ponastavi
          </Button>
        </div>

        {/* Nova slika */}
        <div className="space-y-3">
          <Label htmlFor={inputId}>Nova (zamenjava)</Label>
          <label
            htmlFor={inputId}
            className={`flex ${aspect} cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-card/50 transition-colors hover:border-accent/60`}
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Predogled" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-muted-foreground">
                <UploadCloud className="h-8 w-8" />
                <span className="text-sm">Klikni za izbiro slike</span>
              </span>
            )}
          </label>
          <Input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={onFileChange}
          />
          <Button
            variant="accent"
            onClick={onUpload}
            disabled={loading || !file}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            Shrani
          </Button>
        </div>
      </div>
    </div>
  );
}
