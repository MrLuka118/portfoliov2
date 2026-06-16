"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { Image as ImageIcon, Images, LayoutList, LogOut, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { SETTING_KEYS } from "@/lib/data";
import type { CategoryDTO, ImageDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { ImageUploadForm } from "@/components/admin/image-upload-form";
import { ImageList } from "@/components/admin/image-list";
import { CategoryManager } from "@/components/admin/category-manager";
import { SiteImageManager } from "@/components/admin/site-image-manager";

type Tab = "upload" | "images" | "categories" | "site";

const TABS: { id: Tab; label: string; icon: typeof Upload }[] = [
  { id: "upload", label: "Nalaganje", icon: Upload },
  { id: "images", label: "Slike", icon: Images },
  { id: "categories", label: "Kategorije", icon: LayoutList },
  { id: "site", label: "Slike strani", icon: ImageIcon },
];

/** Glavna admin plošča z zavihki za nalaganje, slike in kategorije. */
export function AdminDashboard({
  initialCategories,
  initialImages,
  heroImage,
  aboutImage,
}: {
  initialCategories: CategoryDTO[];
  initialImages: ImageDTO[];
  heroImage: string;
  aboutImage: string;
}) {
  const [tab, setTab] = React.useState<Tab>("upload");

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Glava */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-lg">
            <span className="font-medium">Luka</span>{" "}
            <span className="font-serif italic text-accent">Photography</span>
          </p>
          <p className="mt-1 text-xs uppercase tracking-label text-muted-foreground">
            Admin panel
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut className="h-4 w-4" />
          Odjava
        </Button>
      </div>

      {/* Zavihki */}
      <div className="mb-8 flex gap-1 border-b border-border">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm transition-colors",
              tab === id
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Vsebina zavihka */}
      {tab === "upload" && <ImageUploadForm categories={initialCategories} />}
      {tab === "images" && (
        <ImageList images={initialImages} categories={initialCategories} />
      )}
      {tab === "categories" && (
        <CategoryManager categories={initialCategories} />
      )}
      {tab === "site" && (
        <div className="space-y-6">
          <SiteImageManager
            settingKey={SETTING_KEYS.heroImage}
            title="Naslovna fotografija (hero)"
            description="Velika fotografija v ozadju vrha strani. Priporočeno vodoravno, vsaj 2000px širine."
            currentImage={heroImage}
            aspect="aspect-[16/9]"
          />
          <SiteImageManager
            settingKey={SETTING_KEYS.aboutImage}
            title="Profilna fotografija (O meni)"
            description="Portret v sekciji About. Priporočeno pokončno razmerje."
            currentImage={aboutImage}
            aspect="aspect-[4/5]"
          />
        </div>
      )}
    </div>
  );
}
