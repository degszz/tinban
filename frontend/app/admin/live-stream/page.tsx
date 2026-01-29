import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LiveStreamAdminPanel } from '@/components/live-stream-admin-panel';
import { getUserMeService } from '@/lib/services/auth-service';
import { getStrapiData, homePageQuery } from '@/lib/strapi';
import { isUserAdmin } from '@/lib/utils/check-admin';

interface AuctionCard {
  id: number;
  documentId?: string;
  title: string;
  stat: string;
}

export default async function AdminLiveStreamPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('strapi_jwt')?.value;

  if (!token) {
    redirect('/signin');
  }

  // Verificar usuario
  const userData = await getUserMeService(token);

  if ('error' in userData) {
    redirect('/signin');
  }

  console.log('👤 Usuario intentando acceder:', {
    email: userData.email,
    username: userData.username,
    role: userData.role,
    isAdmin: userData.isAdmin
  });

  // Verificar si es admin usando la funcion
  if (!isUserAdmin(userData)) {
    console.log('❌ Acceso denegado - No es admin');
    redirect('/');
  }

  console.log('✅ Acceso concedido - Es admin');

  // Obtener datos de Strapi
  const strapiData = await getStrapiData("/api/home-page", homePageQuery);

  // Extraer configuracion del live stream
  const liveStreamActive = strapiData.data?.liveStreamActive || false;
  const youtubeLiveUrl = strapiData.data?.youtubeLiveUrl || '';
  const activeAuctionId = strapiData.data?.activeAuctionId || '';

  // Extraer lista de auctions desde la seccion auctions-section
  const auctionsSection = strapiData.data?.sections?.find(
    (s: any) => s.__component === 'layout.auctions-section'
  );

  const auctions: AuctionCard[] = (auctionsSection?.cards || []).map((card: any) => ({
    id: card.id,
    documentId: card.documentId,
    title: card.title,
    stat: card.stat,
  }));

  return (
    <LiveStreamAdminPanel
      adminUsername={userData.username}
      adminUserId={userData.id.toString()}
      initialLiveStreamActive={liveStreamActive}
      initialYoutubeLiveUrl={youtubeLiveUrl}
      initialActiveAuctionId={activeAuctionId}
      auctions={auctions}
    />
  );
}