import { getCategoriesWithImages, getHeroImage } from "@/lib/data";
import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { Portfolio } from "@/components/gallery/portfolio";
import { AboutSection } from "@/components/about-section";
import { ContactSection } from "@/components/contact-section";

// Glavna stran portfolia. Podatki se pridobijo na strežniku (Server Component).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categoriesWithImages, heroImage] = await Promise.all([
    getCategoriesWithImages(),
    getHeroImage(),
  ]);

  return (
    <main>
      {/* CategoryWithImages je nadtip CategoryDTO, zato ga lahko podamo navigaciji. */}
      <SiteHeader categories={categoriesWithImages} />
      <HeroSection categories={categoriesWithImages} heroImage={heroImage} />
      <Portfolio categories={categoriesWithImages} />
      <AboutSection />
      <ContactSection />
    </main>
  );
}
