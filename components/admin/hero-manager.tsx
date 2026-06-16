"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageIcon, Loader2, RotateCcw, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Upravljanje naslovne (hero) fotografije prek admina. */
export function HeroManager({ currentImage }: { currentImage: string }) {
  const router = useRouter();
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
      const res = await fetch("/api/admin/hero", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Napaka pri nalaganju.");
      toast.success("Naslovna fotografija posodobljena.");
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
      const res = await fetch("/api/admin/hero", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Napaka pri ponastavitvi.");
      }
      toast.success("Ponastavljeno na privzeto fotografijo.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Napaka pri ponastavitvi.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Trenutna naslovna fotografija */}
      <div className="space-y-3">
        <Label>Trenutna naslovna fotografija</Label>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage}
            alt="Trenutna naslovna fotografija"
            className="h-full w-full object-cover"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={resetting}
        >
          {resetting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Ponastavi na privzeto
        </Button>
      </div>

      {/* Nova naslovna fotografija */}
      <div className="space-y-3">
        <Label htmlFor="hero_file">Nova fotografija (zamenjava)</Label>
        <label
          htmlFor="hero_file"
          className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-card/50 transition-colors hover:border-accent/60"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Predogled" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 text-muted-foreground">
              <UploadCloud className="h-8 w-8" />
              <span className="text-sm">Klikni za izbiro slike</span>
              <span className="text-xs">Priporočeno vodoravno, vsaj 2000px širine</span>
            </span>
          )}
        </label>
        <Input
          id="hero_file"
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
          Nastavi kot naslovno
        </Button>
      </div>
    </div>
  );
}
