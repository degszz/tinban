import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LiveStreamAdminPanel } from '@/components/live-stream-admin-panel';
import { getUserMeService } from '@/lib/services/auth-service';
import { getStrapiData, homePageQuery } from '@/lib/strapi';
import { isUserAdmin } from '@/lib/utils/check-admin';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

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

  // Obtener config del live stream desde content-type separado
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

  // Obtener lista de auctions desde home-page (solo para el selector)
  const strapiData = await getStrapiData("/api/home-page", homePageQuery);
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