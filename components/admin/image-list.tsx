"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

import type { CategoryDTO, ImageDTO } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Seznam vseh slik s predogledom in brisanjem. */
export function ImageList({
  images,
  categories,
}: {
  images: ImageDTO[];
  categories: CategoryDTO[];
}) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = React.useState<ImageDTO | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.title_sl ?? "—";

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/images/${pendingDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Napaka pri brisanju.");
      }
      toast.success("Slika izbrisana.");
      setPendingDelete(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Napaka pri brisanju.");
    } finally {
      setDeleting(false);
    }
  }

  if (images.length === 0) {
    return <p className="text-sm text-muted-foreground">Ni naloženih slik.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative overflow-hidden rounded-lg border border-border bg-card"
          >
            <div className="relative aspect-square">
              <Image
                src={img.imageUrl}
                alt={img.title_sl}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <p className="truncate text-sm">{img.title_sl}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {categoryName(img.categoryId)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPendingDelete(img)}
              aria-label="Izbriši sliko"
              className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-md bg-black/60 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Izbriši sliko?</DialogTitle>
            <DialogDescription>
              Slika »{pendingDelete?.title_sl}« bo trajno izbrisana iz galerije
              in shrambe. Tega dejanja ni mogoče razveljaviti.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Prekliči
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Izbriši
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
