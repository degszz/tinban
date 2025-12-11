// app/page.tsx
import { getStrapiData, homePageQuery } from "@/lib/strapi";
import { HeroSection } from "@/components/hero-section";
import { Header } from "@/components/header";
import { AuctionsSection } from "@/components/auctions-section";

export default async function Home() {
  const strapiData = await getStrapiData("/api/home-page", homePageQuery);

  console.log('📦 Home Page Data:', JSON.stringify(strapiData.data, null, 2));

  if (!strapiData || !strapiData.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Error cargando datos
          </h1>
          <p className="mt-2 text-gray-600">
            Verifica que Strapi esté corriendo y configurado correctamente
          </p>
        </div>
      </div>
    );
  }

  const { layout, sections } = strapiData.data;

  return (
    <>
      {/* Header */}
      {layout && <Header data={layout} />}

      {/* Main Content */}
      <main>
        {sections && sections.map((section: any, index: number) => {
          switch (section.__component) {
            case 'layout.hero-section':
              return <HeroSection key={index} data={section} />;

            case 'layout.auctions-section':
              return <AuctionsSection key={index} data={section} />;

            default:
              return null;
          }
        })}
      </main>
    </>
  );
}