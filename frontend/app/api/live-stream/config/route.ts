import { NextRequest, NextResponse } from 'next/server';
import qs from 'qs';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function GET(request: NextRequest) {
  try {
    // Fetch from the separate live-stream-config content type (not home-page)
    const configResponse = await fetch(
      `${STRAPI_URL}/api/live-stream-config`,
      { cache: 'no-store' }
    );

    if (!configResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }

    const configData = await configResponse.json();
    const { liveStreamActive, youtubeLiveUrl, activeAuctionId } = configData.data || {};

    let selectedAuction = null;

    if (activeAuctionId) {
      const auctionsQuery = qs.stringify({
        populate: {
          sections: {
            on: {
              'layout.auctions-section': {
                populate: {
                  cards: {
                    populate: ['image', 'link'],
                  },
                },
              },
            },
          },
        },
      });

      const auctionsResponse = await fetch(
        `${STRAPI_URL}/api/home-page?${auctionsQuery}`,
        { cache: 'no-store' }
      );

      if (auctionsResponse.ok) {
        const auctionsData = await auctionsResponse.json();
        const sections = auctionsData.data?.sections || [];
        const auctionSection = sections.find(
          (s: any) => s.__component === 'layout.auctions-section'
        );

        selectedAuction = auctionSection?.cards?.find(
          (card: any) =>
            card.documentId === activeAuctionId ||
            card.id.toString() === activeAuctionId ||
            card.title === activeAuctionId
        ) || null;
      }
    }

    return NextResponse.json({
      liveStreamActive: liveStreamActive || false,
      youtubeLiveUrl: youtubeLiveUrl || '',
      activeAuctionId: activeAuctionId || '',
      selectedAuction,
    });

  } catch (error) {
    console.error('Error in GET /api/live-stream/config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
