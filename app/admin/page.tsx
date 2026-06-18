import {
  getCategories,
  getAllImages,
  getHeroImage,
  getAboutImage,
} from "@/lib/data";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

// Admin nadzorna plošča (zaščitena prek middleware.ts).
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [categories, images, heroImage, aboutImage, session] = await Promise.all([
    getCategories(),
    getAllImages(),
    getHeroImage(),
    getAboutImage(),
    getSession(),
  ]);

  // Ali ima prijavljeni uporabnik vklopljeno 2FA?
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { totpSecret: true },
      })
    : null;
  const twoFactorEnabled = Boolean(user?.totpSecret);

  return (
    <AdminDashboard
      initialCategories={categories}
      initialImages={images}
      heroImage={heroImage}
      aboutImage={aboutImage}
      twoFactorEnabled={twoFactorEnabled}
    />
  );
}
