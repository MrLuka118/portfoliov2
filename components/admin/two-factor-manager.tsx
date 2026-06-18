"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Upravljanje dvofaktorske avtentikacije (TOTP).
 * - Če 2FA ni vklopljen: gumb za začetek vpisa → QR koda + potrditvena koda.
 * - Če je vklopljen: prikaz statusa + izklop (z veljavno kodo).
 */
export function TwoFactorManager({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  // Vpis nove naprave
  const [secret, setSecret] = React.useState<string | null>(null);
  const [qr, setQr] = React.useState<string | null>(null);
  const [enableCode, setEnableCode] = React.useState("");

  // Izklop
  const [disableCode, setDisableCode] = React.useState("");

  async function startSetup() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Napaka pri pripravi 2FA.");
      setSecret(data.secret);
      setQr(data.qr);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Napaka.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmEnable(e: React.FormEvent) {
    e.preventDefault();
    if (!secret) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, code: enableCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Napaka pri vklopu.");
      toast.success("Dvofaktorska avtentikacija je vklopljena.");
      setSecret(null);
      setQr(null);
      setEnableCode("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Napaka.");
    } finally {
      setLoading(false);
    }
  }

  async function disable(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: disableCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Napaka pri izklopu.");
      toast.success("Dvofaktorska avtentikacija je izklopljena.");
      setDisableCode("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Napaka.");
    } finally {
      setLoading(false);
    }
  }

  // --- Vklopljeno: prikaz statusa + izklop ---
  if (enabled) {
    return (
      <div className="max-w-md space-y-6">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
          <div>
            <p className="text-sm font-medium">Dvofaktorska avtentikacija je vklopljena</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pri prijavi je poleg gesla potrebna 6-mestna koda iz tvoje
              authenticator aplikacije.
            </p>
          </div>
        </div>

        <form onSubmit={disable} className="space-y-3">
          <Label htmlFor="disableCode">Za izklop vnesi trenutno 2FA kodo</Label>
          <Input
            id="disableCode"
            inputMode="numeric"
            placeholder="123456"
            maxLength={6}
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
            required
          />
          <Button type="submit" variant="outline" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Izklopi 2FA
          </Button>
        </form>
      </div>
    );
  }

  // --- Izklopljeno: vpis nove naprave ---
  return (
    <div className="max-w-md space-y-6">
      <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-medium">Dvofaktorska avtentikacija ni vklopljena</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Priporočeno: dodaj drugi faktor, da admin panel zaščitiš tudi, če
            kdo izve tvoje geslo.
          </p>
        </div>
      </div>

      {!qr ? (
        <Button onClick={startSetup} variant="accent" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Vklopi 2FA
        </Button>
      ) : (
        <div className="space-y-5 rounded-lg border border-border bg-card p-5">
          <div className="space-y-2">
            <p className="text-sm font-medium">1. Skeniraj QR kodo</p>
            <p className="text-xs text-muted-foreground">
              Odpri Google Authenticator, Authy ali podobno aplikacijo in
              skeniraj kodo.
            </p>
            <div className="inline-block rounded-lg bg-white p-2">
              {/* QR je data-URL PNG */}
              <Image src={qr} alt="QR koda za 2FA" width={200} height={200} unoptimized />
            </div>
            {secret && (
              <p className="break-all text-xs text-muted-foreground">
                Ročni vnos: <span className="font-mono">{secret}</span>
              </p>
            )}
          </div>

          <form onSubmit={confirmEnable} className="space-y-3">
            <Label htmlFor="enableCode">2. Vnesi kodo iz aplikacije za potrditev</Label>
            <Input
              id="enableCode"
              inputMode="numeric"
              placeholder="123456"
              maxLength={6}
              value={enableCode}
              onChange={(e) => setEnableCode(e.target.value.replace(/\D/g, ""))}
              autoFocus
              required
            />
            <Button type="submit" variant="accent" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Potrdi in vklopi
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
