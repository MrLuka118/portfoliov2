"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Loader2, ShieldCheck, KeyRound, QrCode } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Posebna oznaka napake iz strežnika: potrebna je 2FA koda. */
const TOTP_REQUIRED = "TOTP_REQUIRED";

type Mode = "password" | "qr";

/** Kam preusmeriti po uspešni prijavi (spoštuj ?callbackUrl, sicer /admin). */
function getCallbackUrl(): string {
  if (typeof window === "undefined") return "/admin";
  const cb = new URLSearchParams(window.location.search).get("callbackUrl");
  // Dovoli le interne poti (prepreči odprto preusmeritev).
  if (cb && cb.startsWith("/")) return cb;
  return "/admin";
}

/** Prijavni obrazec: način z geslom (+2FA) ali s skeniranjem QR kode. */
export function LoginForm() {
  const [mode, setMode] = React.useState<Mode>("password");

  return (
    <div className="space-y-5 rounded-lg border border-border bg-card p-6">
      {/* Preklop med načinoma prijave */}
      <div className="grid grid-cols-2 gap-1 rounded-md border border-border p-1">
        <button
          type="button"
          onClick={() => setMode("password")}
          className={cn(
            "flex items-center justify-center gap-2 rounded py-2 text-sm transition-colors",
            mode === "password"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <KeyRound className="h-4 w-4" />
          Geslo
        </button>
        <button
          type="button"
          onClick={() => setMode("qr")}
          className={cn(
            "flex items-center justify-center gap-2 rounded py-2 text-sm transition-colors",
            mode === "qr"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <QrCode className="h-4 w-4" />
          QR koda
        </button>
      </div>

      {mode === "password" ? <PasswordLogin /> : <QrLogin />}
    </div>
  );
}

/** Prijava z e-pošto + geslom + (po potrebi) 2FA kodo. */
function PasswordLogin() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [totp, setTotp] = React.useState("");
  const [needTotp, setNeedTotp] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      totp,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      if (res.error === TOTP_REQUIRED) {
        setNeedTotp(true);
        setError(null);
        return;
      }
      setError(needTotp ? "Napačna 2FA koda." : "Napačna e-pošta ali geslo.");
      return;
    }

    router.replace(getCallbackUrl());
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">E-pošta</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={needTotp}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Geslo</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={needTotp}
          required
        />
      </div>

      {needTotp && (
        <div className="space-y-2">
          <Label htmlFor="totp" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Koda iz authenticator aplikacije
          </Label>
          <Input
            id="totp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            maxLength={6}
            value={totp}
            onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
            autoFocus
            required
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" variant="accent" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {needTotp ? "Potrdi kodo" : "Prijava"}
      </Button>
    </form>
  );
}

/** Prijava s skeniranjem QR kode z že prijavljene naprave (telefon). */
function QrLogin() {
  const router = useRouter();
  const [qr, setQr] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<
    "loading" | "pending" | "approved" | "expired"
  >("loading");
  // Trenutni token hranimo v ref, da ga polling vedno bere pravilno.
  const tokenRef = React.useRef<string | null>(null);

  const createRequest = React.useCallback(async () => {
    setStatus("loading");
    setQr(null);
    try {
      const res = await fetch("/api/auth/qr/create", { method: "POST" });
      const data = await res.json();
      tokenRef.current = data.token;
      setQr(data.qr);
      setStatus("pending");
    } catch {
      setStatus("expired");
    }
  }, []);

  // Ob prikazu QR načina ustvari prvo zahtevo.
  React.useEffect(() => {
    createRequest();
  }, [createRequest]);

  // Poizvedovanje stanja vsako sekundo, dokler je odprto.
  React.useEffect(() => {
    if (status !== "pending") return;
    const id = setInterval(async () => {
      const token = tokenRef.current;
      if (!token) return;
      try {
        const res = await fetch(
          `/api/auth/qr/status?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();
        if (data.status === "approved") {
          clearInterval(id);
          setStatus("approved");
          // Telefon je odobril → unovči token in vzpostavi sejo.
          const signed = await signIn("qr", { token, redirect: false });
          if (signed?.error) {
            setStatus("expired");
            return;
          }
          router.replace(getCallbackUrl());
          router.refresh();
        } else if (data.status === "expired") {
          clearInterval(id);
          setStatus("expired");
        }
      } catch {
        /* prehodna napaka mreže — poskusi ob naslednjem tiku */
      }
    }, 1000);
    return () => clearInterval(id);
  }, [status, router]);

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">
        Skeniraj kodo s telefona, ki je že prijavljen, in potrdi prijavo.
      </p>

      <div className="flex min-h-[224px] items-center justify-center">
        {status === "loading" && (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        )}

        {qr && (status === "pending" || status === "approved") && (
          <div className="space-y-3">
            <div className="inline-block rounded-lg bg-white p-2">
              <Image
                src={qr}
                alt="QR koda za prijavo"
                width={200}
                height={200}
                unoptimized
              />
            </div>
            {status === "approved" && (
              <p className="flex items-center justify-center gap-2 text-sm text-emerald-500">
                <ShieldCheck className="h-4 w-4" />
                Potrjeno, prijavljam …
              </p>
            )}
          </div>
        )}

        {status === "expired" && (
          <div className="space-y-3">
            <p className="text-sm text-destructive">
              QR koda je potekla.
            </p>
            <Button type="button" variant="outline" onClick={createRequest}>
              Ustvari novo kodo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
