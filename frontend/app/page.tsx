// app/page.tsx
import { getStrapiData, homePageQuery } from "@/lib/strapi";
import { HeroSection } from "@/components/hero-section";
import { Header } from "@/components/header";
import About from "@/components/about";

import { AuctionsSection } from "@/components/auctions-section";
import { cookies } from "next/headers";
import { Footer } from "@/components/footer";
import { getUserFavorites } from "@/lib/services/favorites-service";
import { getUserMeService } from "@/lib/services/auth-service";


export default async function Home() {
  const strapiData = await getStrapiData("/api/home-page", homePageQuery);

  console.log('📦 Home Page Data:', JSON.stringify(strapiData.data, null, 2));

  // Debug específico para las cards
  const auctionsSection = strapiData.data?.sections?.find(
    (s: any) => s.__component === 'layout.auctions-section'
  );

  if (auctionsSection?.cards) {
    console.log('\n🎴 Cards Debug:');
    auctionsSection.cards.forEach((card: any, index: number) => {
      console.log(`  Card ${index + 1}:`, {
        id: card.id,
        title: card.title,
        price: card.Price,  // Cambiado a Price (con mayúscula)
        priceType: typeof card.Price,
        hasPrice: card.Price !== undefined,
      });
    });
  }

  // 🔧 OBTENER JWT DE STRAPI
  const cookie = (await cookies()).get("strapi_jwt")?.value;
  let session = null;

  // Si hay JWT, obtener datos del usuario
  if (cookie) {
    try {
      const userData = await getUserMeService(cookie);
      if (!("error" in userData)) {
        session = {
          userId: userData.id,
          username: userData.username,
          email: userData.email,
        };
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }

  console.log('👤 User Session:', {
    userId: session?.userId,
    username: session?.username,
    isLoggedIn: !!session?.userId
  });

  // Obtener favoritos del usuario si está logueado
  const userFavorites = session?.userId ? await getUserFavorites() : [];

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
              return (
                <AuctionsSection
                  key={index}
                  data={section}
                  userId={session?.userId?.toString()}
                  userName={session?.username}
                  userFavorites={userFavorites}
                />
              );

            default:
              return null;
          }
        })}

      </main>
      <About></About>
      <Footer></Footer>
    </>
  );
}
