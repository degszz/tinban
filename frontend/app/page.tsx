// app/page.tsx
import { getStrapiData, homePageQuery } from "@/lib/strapi";
import { HeroSection } from "@/components/hero-section";
import { Header } from "@/components/header";
import About from "@/components/about";
import { LiveStreamBanner } from "@/components/live-stream-banner";
import { AuctionsSection } from "@/components/auctions-section";
import { cookies } from "next/headers";
import { Footer } from "@/components/footer";
import { getUserFavorites } from "@/lib/services/favorites-service";
import { getUserMeService } from "@/lib/services/auth-service";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';


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
        price: card.Price,
        priceType: typeof card.Price,
        hasPrice: card.Price !== undefined,
      });
    });
  }

  // 🔧 OBTENER JWT DE STRAPI
  const cookie = (await cookies()).get("strapi_jwt")?.value;
  let session = null;

  // Si hay JWT, obtener datos del usuario
  let userCredits = 0;
  if (cookie) {
    try {
      const userData = await getUserMeService(cookie);
      if (!("error" in userData)) {
        session = {
          userId: userData.id,
          username: userData.username,
          email: userData.email,
        };
        userCredits = userData.credits || 0;
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

  // Obtener config del live stream desde content-type separado (no afecta revalidación de home-page)
  let liveStreamActive = false;
  let youtubeLiveUrl = '';
  let activeAuctionId = '';

  try {
    const configResponse = await fetch(`${STRAPI_URL}/api/live-stream-config`, {
      cache: 'no-store',
    });
    if (configResponse.ok) {
      const configData = await configResponse.json();
      liveStreamActive = configData.data?.liveStreamActive || false;
      youtubeLiveUrl = configData.data?.youtubeLiveUrl || '';
      activeAuctionId = configData.data?.activeAuctionId || '';
    }
  } catch (error) {
    console.error('Error fetching live stream config:', error);
  }

  // Encontrar la auction seleccionada para el live stream (by title)
  const selectedAuction = activeAuctionId
    ? auctionsSection?.cards?.find((card: any) => card.title === activeAuctionId)
    : null;

  return (
    <>
      {/* Header */}
      {layout && <Header data={layout} />}

      {/* Main Content */}
      <main>
        {/* Hero Section - SIEMPRE PRIMERO */}
        {sections && sections.map((section: any, index: number) => {
          if (section.__component === 'layout.hero-section') {
            return <HeroSection key={index} data={section} />;
          }
          return null;
        })}

        {/* Banner de Live Stream Activo */}
        {liveStreamActive && youtubeLiveUrl && (
          <LiveStreamBanner auctionTitle={selectedAuction?.title} />
        )}

        <div id="auctions"></div>
        {/* Resto de secciones (Auctions, etc.) */}
        {sections && sections.map((section: any, index: number) => {
          switch (section.__component) {
            case 'layout.hero-section':
              // Ya renderizado arriba
              return null;

            case 'layout.auctions-section':
              return (
                <AuctionsSection
                  key={index}
                  data={section}
                  userId={session?.userId?.toString()}
                  userName={session?.username}
                  userFavorites={userFavorites}
                  initialActiveAuctionId={activeAuctionId}
                  initialLiveStreamActive={liveStreamActive}
                />
              );

            default:
              return null;
          }
        })}

      </main>
      <div id="about" className=""></div>
      <About></About>
      <Footer></Footer>
    </>
  );
}
