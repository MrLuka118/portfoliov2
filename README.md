# Luka Photography — fotografski portfolio

Premium fotografski portfolio v **Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui**
z admin panelom za upravljanje slik in kategorij.

- 🎨 Temna premium tema, zamolkel champagne/bron akcent, serif (Playfair Display) + sans (Inter)
- 🖼️ Galerija s tremi postavitvami (masonry / celozaslonsko / mreža), preklop brez reloada
- 🔦 Lightbox, hover zoom, fade-in animacije ob scrollu (framer-motion)
- 🌍 Večjezičnost SLO / HR / EN (React Context + JSON, izbira shranjena v localStorage/cookie)
- 🧭 Kategorije kot fiksen meni s smooth-scroll do sekcij in označevanjem aktivne (Intersection Observer)
- 🔐 Admin panel (`/admin`) zaščiten z NextAuth (bcrypt), nalaganje slik v Vercel Blob
- 🗄️ Postgres (Neon) prek Prisma ORM

---

## 1. Tehnološki sklad

| Področje      | Izbira                                   |
| ------------- | ---------------------------------------- |
| Framework     | Next.js 15 (App Router, RSC)             |
| Jezik         | TypeScript                               |
| Stil          | Tailwind CSS + shadcn/ui                  |
| Animacije     | framer-motion                            |
| Baza          | PostgreSQL (Neon) + Prisma               |
| Avtentikacija | NextAuth (Credentials + bcrypt)          |
| Shramba slik  | Vercel Blob                              |
| i18n          | React Context + `/messages/*.json`       |

> Komponente shadcn/ui so v `/components/ui` (pričakovana pot shadcn CLI-ja — ohrani jo,
> da `npx shadcn@latest add <komponenta>` deluje za posodobitve in nove komponente).

---

## 2. Lokalni zagon

### Predpogoji
- Node.js 18+ (priporočeno 20+)
- Postgres baza (najlažje brezplačen [Neon](https://neon.tech) projekt)

### Koraki

```bash
# 1) namesti odvisnosti
npm install

# 2) okoljske spremenljivke
cp .env.example .env
#   izpolni DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, BLOB_READ_WRITE_TOKEN ...
#   NEXTAUTH_SECRET generiraj z:  openssl rand -base64 32

# 3) ustvari tabele v bazi
npx prisma migrate dev --name init

# 4) napolni začetne podatke (admin uporabnik + kategorije + vzorčne slike)
npm run db:seed

# 5) zaženi razvojni strežnik
npm run dev
```

Aplikacija teče na <http://localhost:3000>, admin na <http://localhost:3000/admin>
(privzeti uporabnik iz `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD`).

Uporabne skripte:

```bash
npm run dev          # razvojni strežnik
npm run build        # produkcijski build (prisma generate + next build)
npm run db:migrate   # nova migracija (razvoj)
npm run db:seed      # začetni podatki
npm run db:studio    # Prisma Studio (pregled baze)
```

---

## 3. Nastavitev baze (Neon)

1. Ustvari projekt na <https://neon.tech>.
2. V **Dashboard → Connection Details** kopiraj dva niza:
   - **Pooled** connection → `DATABASE_URL` (host vsebuje `-pooler`)
   - **Direct** connection → `DIRECT_URL` (host brez `-pooler`)
3. Obema dodaj `?sslmode=require`.
4. Lokalno poženi `npx prisma migrate dev`, na produkciji `npx prisma migrate deploy`.

> Supabase deluje enako (Postgres + Prisma) — uporabi njegov connection string;
> i18n in ostala koda se ne spremenita.

### Vercel Blob (shramba slik)

1. Vercel Dashboard → **Storage → Create → Blob**.
2. Poveži shrambo s projektom; Vercel doda `BLOB_READ_WRITE_TOKEN` med env spremenljivke.
3. Za lokalno nalaganje kopiraj `BLOB_READ_WRITE_TOKEN` v `.env`.

---

## 4. Deploy na Vercel (prek Git)

1. Potisni repozitorij na GitHub/GitLab.
2. Na <https://vercel.com> → **New Project** → uvozi repo.
3. V **Settings → Environment Variables** dodaj:
   - `DATABASE_URL`, `DIRECT_URL`
   - `NEXTAUTH_SECRET`  (`openssl rand -base64 32`)
   - `NEXTAUTH_URL` = produkcijska domena (npr. `https://tvoja-domena.vercel.app`)
   - `BLOB_READ_WRITE_TOKEN` (samodejno, če dodaš Blob storage)
4. Build Command je privzeto `npm run build` (vključuje `prisma generate`).
5. Po prvem deployu poženi migracije proti produkcijski bazi:
   ```bash
   npx prisma migrate deploy        # ali dodaj v build: "prisma migrate deploy && next build"
   npm run db:seed                  # enkratno, za admin uporabnika in kategorije
   ```
   (Seed lahko zaženeš lokalno z nastavljenim produkcijskim `DATABASE_URL`.)

---

## 5. Struktura projekta

```
app/
  layout.tsx            # fonti, providerji, <html lang> iz piškotka
  page.tsx              # glavna stran (RSC): hero + galerija + footer
  globals.css           # barvni tokeni (champagne akcent), dark tema
  admin/                # admin panel (login + dashboard), zaščiten z middleware
  api/
    auth/[...nextauth]/  # NextAuth handler
    public/              # javni GET: kategorije / slike (vsa 3 jezikovna polja)
    admin/               # zaščiteni: upload, brisanje, kategorije (CRUD)
components/
  ui/                   # shadcn/ui primitive (button, dialog, input, select ...)
  hero-section.tsx      # HERO z foto ozadjem + marquee + scroll indikator
  site-header.tsx       # sticky navigacija + jezikovni preklopnik + mobilni meni
  gallery/              # portfolio, 3 postavitve, lightbox, category-bar
  admin/                # obrazci in seznami admin panela
context/language-context.tsx   # i18n Context (t(), setLocale)
messages/{sl,hr,en}.json       # prevodi
hooks/use-active-section.ts    # označevanje aktivne kategorije ob scrollu
lib/{prisma,auth,data,utils}.ts
prisma/{schema.prisma,seed.ts}
```

### Prilagajanje

- **Hero fotografija:** `components/hero-section.tsx` → `HERO_IMAGE` (lokalna `/public` ali Blob URL).
- **Barve / akcent:** `app/globals.css` (CSS spremenljivke; `--accent` = champagne `#b8975f`).
- **Pisave:** `app/layout.tsx` (`next/font`).
- **Prevodi:** `messages/*.json`.
- **Kategorije in slike:** prek admin panela (`/admin`).
