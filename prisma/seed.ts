/**
 * Začetni podatki za bazo.
 * Zažene se z `npm run db:seed` (ali `npx prisma db seed`).
 *
 * Ustvari:
 *  - admin uporabnika iz SEED_ADMIN_USERNAME / SEED_ADMIN_PASSWORD
 *  - nekaj privzetih kategorij (tri-jezični naslovi)
 *  - vzorčne slike (Unsplash) za hiter prikaz – po želji izbriši v admin panelu
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    slug: "weddings",
    titleSl: "Poroke",
    titleHr: "Vjenčanja",
    titleEn: "Weddings",
    position: 1,
    photos: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "concerts",
    titleSl: "Koncerti",
    titleHr: "Koncerti",
    titleEn: "Concerts",
    position: 2,
    photos: [
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "portraits",
    titleSl: "Portreti",
    titleHr: "Portreti",
    titleEn: "Portraits",
    position: 3,
    photos: [
      "https://images.unsplash.com/photo-1492288991661-058aa541ff43?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "events",
    titleSl: "Dogodki",
    titleHr: "Događaji",
    titleEn: "Events",
    position: 4,
    photos: [
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    slug: "landscapes",
    titleSl: "Pokrajine",
    titleHr: "Krajolici",
    titleEn: "Landscapes",
    position: 5,
    photos: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

async function main() {
  // --- Admin uporabnik ---
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com")
    .trim()
    .toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin1234";
  const passwordHash = await bcrypt.hash(password, 10);

  // Upsert po uporabniškem imenu (stabilen ključ tudi za obstoječe baze);
  // e-pošta je primarni identifikator za prijavo.
  await prisma.user.upsert({
    where: { username },
    update: { email, passwordHash },
    create: { username, email, passwordHash },
  });
  console.log(`✓ Admin uporabnik: ${email}`);

  // --- Kategorije + vzorčne slike ---
  for (const cat of CATEGORIES) {
    const { photos, ...data } = cat;
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        titleSl: data.titleSl,
        titleHr: data.titleHr,
        titleEn: data.titleEn,
        position: data.position,
      },
      create: data,
    });

    // Dodaj vzorčne slike le, če kategorija še nima nobene.
    const existing = await prisma.image.count({
      where: { categoryId: category.id },
    });
    if (existing === 0) {
      await prisma.image.createMany({
        data: photos.map((url, i) => ({
          titleSl: `${data.titleSl} ${i + 1}`,
          titleHr: `${data.titleHr} ${i + 1}`,
          titleEn: `${data.titleEn} ${i + 1}`,
          imageUrl: url,
          width: 1200,
          height: 800,
          categoryId: category.id,
        })),
      });
    }
    console.log(`✓ Kategorija: ${cat.slug} (${photos.length} slik)`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
