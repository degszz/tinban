// app/page.tsx
import { getStrapiData, homePageQuery } from "@/lib/strapi";
import { HeroSection } from "@/components/hero-section";
import { Header } from "@/components/header";
import About from "@/components/about";
import { YouTubeLiveChat } from "@/components/youtube-live-chat";
import { LiveStreamLoginPrompt } from "@/components/live-stream-login-prompt";
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

  const { layout, sections, youtubeLiveUrl, liveStreamActive, activeAuctionId } = strapiData.data;

  // DEBUG 1: Log activeAuctionId value
  console.log('\n========== DEBUG LOGS ==========');
  console.log('1️⃣ activeAuctionId from strapiData.data:', activeAuctionId);
  console.log('   Type:', typeof activeAuctionId);

  // DEBUG 2: Log all cards with id and documentId
  console.log('\n2️⃣ All cards in auctionsSection:');
  if (auctionsSection?.cards) {
    auctionsSection.cards.forEach((card: any, index: number) => {
      console.log(`   Card ${index}:`, {
        id: card.id,
        documentId: card.documentId,
        title: card.title,
      });
    });
  } else {
    console.log('   No cards found in auctionsSection');
  }

  // Encontrar la auction seleccionada para el live stream (by title)
  const selectedAuction = activeAuctionId
    ? auctionsSection?.cards?.find((card: any) => card.title === activeAuctionId)
    : null;

  // DEBUG 3: Log selectedAuction result
  console.log('\n3️⃣ selectedAuction result:', selectedAuction ? {
    id: selectedAuction.id,
    documentId: selectedAuction.documentId,
    title: selectedAuction.title,
    found: true
  } : 'null - No matching card found');

  // DEBUG: Show the comparison being made
  if (activeAuctionId && !selectedAuction) {
    console.log('\n⚠️  WHY NOT FOUND:');
    console.log('   Looking for activeAuctionId:', activeAuctionId);
    console.log('   Available documentIds:', auctionsSection?.cards?.map((c: any) => c.documentId));
    console.log('   Available ids:', auctionsSection?.cards?.map((c: any) => c.id));
  }
  console.log('================================\n');

  console.log('💰 userCredits:', userCredits);

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

        {/* YouTube Live Stream con Chat y Auction Seleccionada */}
        {liveStreamActive && youtubeLiveUrl && (
          <section className="py-8 bg-gray-50">
            {session?.userId ? (
              <YouTubeLiveChat
                youtubeUrl={youtubeLiveUrl}
                username={session.username || 'Usuario'}
                userId={session.userId.toString()}
                selectedAuction={selectedAuction}
                userFavorites={userFavorites}
                initialCredits={userCredits}
              />
            ) : (
              <LiveStreamLoginPrompt />
            )}
          </section>
        )}

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
