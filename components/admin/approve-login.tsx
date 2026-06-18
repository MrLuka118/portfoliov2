"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, ShieldCheck, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Gumb za potrditev prijave na drugi napravi (odpre se na telefonu prek QR).
 * Ker je stran pod /admin, je naprava ob prikazu že prijavljena.
 */
export function ApproveLogin({ token }: { token: string | null }) {
  const [state, setState] = React.useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [error, setError] = React.useState<string | null>(null);

  async function approve() {
    if (!token) return;
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/admin/qr/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Napaka pri potrditvi.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Napaka.");
      setState("error");
    }
  }

  if (!token) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-sm text-destructive">Manjka koda prijave.</p>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-emerald-500" />
        <p className="mt-3 text-sm font-medium">Prijava potrjena</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Vrni se na računalnik — samodejno te bo prijavilo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-lg border border-border bg-card p-6 text-center">
      <QrCode className="mx-auto h-10 w-10 text-accent" />
      <div>
        <p className="text-sm font-medium">Potrdi prijavo na drugi napravi</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Si ravnokar skeniral QR kodo na svojem računalniku? Potrdi spodaj.
          Če tega nisi sprožil ti, zapri to stran.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        onClick={approve}
        variant="accent"
        className="w-full"
        disabled={state === "loading"}
      >
        {state === "loading" && <Loader2 className="h-4 w-4 animate-spin" />}
        Da, prijavi to napravo
      </Button>

      <Link
        href="/admin"
        className="block text-xs text-muted-foreground hover:text-foreground"
      >
        Prekliči
      </Link>
    </div>
  );
}
