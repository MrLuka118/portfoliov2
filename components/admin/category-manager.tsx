"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react";

import type { CategoryDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Upravljanje kategorij: seznam, dodajanje (3 jeziki), brisanje z opozorilom. */
export function CategoryManager({
  categories,
}: {
  categories: CategoryDTO[];
}) {
  const router = useRouter();
  const [titleSl, setTitleSl] = React.useState("");
  const [titleHr, setTitleHr] = React.useState("");
  const [titleEn, setTitleEn] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [pendingDelete, setPendingDelete] = React.useState<CategoryDTO | null>(
    null
  );
  const [deleting, setDeleting] = React.useState(false);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title_sl: titleSl,
          title_hr: titleHr,
          title_en: titleEn,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Napaka pri dodajanju.");
      toast.success("Kategorija dodana.");
      setTitleSl("");
      setTitleHr("");
      setTitleEn("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Napaka pri dodajanju.");
    } finally {
      setAdding(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${pendingDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Napaka pri brisanju.");
      }
      toast.success("Kategorija izbrisana.");
      setPendingDelete(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Napaka pri brisanju.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Dodaj kategorijo */}
      <form
        onSubmit={onAdd}
        className="space-y-5 rounded-lg border border-border bg-card p-6"
      >
        <h3 className="font-serif text-lg">Nova kategorija</h3>
        <div className="space-y-2">
          <Label htmlFor="cat_sl">Naslov (SLO)</Label>
          <Input
            id="cat_sl"
            value={titleSl}
            onChange={(e) => setTitleSl(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cat_hr">Naslov (HR)</Label>
          <Input
            id="cat_hr"
            value={titleHr}
            onChange={(e) => setTitleHr(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cat_en">Naslov (EN)</Label>
          <Input
            id="cat_en"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            required
          />
        </div>
        <Button type="submit" variant="accent" disabled={adding} className="w-full">
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Dodaj kategorijo
        </Button>
      </form>

      {/* Seznam kategorij */}
      <div>
        <h3 className="mb-4 font-serif text-lg">Obstoječe kategorije</h3>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ni kategorij.</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-sm">{cat.title_sl}</p>
                  <p className="text-xs text-muted-foreground">
                    {cat.title_hr} · {cat.title_en} · {cat.imageCount} slik
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingDelete(cat)}
                  aria-label="Izbriši kategorijo"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Potrditev brisanja (z opozorilom, če vsebuje slike) */}
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(o) => !o && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Izbriši kategorijo?</DialogTitle>
            <DialogDescription>
              Kategorija »{pendingDelete?.title_sl}« bo trajno izbrisana.
            </DialogDescription>
          </DialogHeader>
          {pendingDelete && pendingDelete.imageCount > 0 && (
            <div className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Pozor: kategorija vsebuje {pendingDelete.imageCount} slik, ki
                bodo prav tako izbrisane (vključno z datotekami v shrambi).
              </span>
            </div>
          )}
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
    </div>
  );
}
