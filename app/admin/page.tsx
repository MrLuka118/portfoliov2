import {
  getCategories,
  getAllImages,
  getHeroImage,
  getAboutImage,
} from "@/lib/data";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

// Admin nadzorna plošča (zaščitena prek middleware.ts).
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [categories, images, heroImage, aboutImage] = await Promise.all([
    getCategories(),
    getAllImages(),
    getHeroImage(),
    getAboutImage(),
  ]);

  return (
    <AdminDashboard
      initialCategories={categories}
      initialImages={images}
      heroImage={heroImage}
      aboutImage={aboutImage}
    />
  );
}
