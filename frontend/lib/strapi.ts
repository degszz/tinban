// lib/strapi.ts
import qs from "qs";

const BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

/**
 * Query para poblar la Home Page completa
 */
export const homePageQuery = qs.stringify({
  populate: {
    layout: {
      populate: '*',
    },
    sections: {
      on: {
        'layout.hero-section': {
          populate: {
            image: {
              fields: ['url', 'alternativeText'],
            },
            link: {
              populate: '*',
            },
          },
        },
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

export async function getStrapiData(path: string, query?: string) {
  const url = new URL(path, BASE_URL);
  if (query) url.search = query;

  console.log('🔍 Fetching URL:', url.href);

  try {
    const response = await fetch(url.href, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP ${response.status}:`, errorText);
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Data received from Strapi');
    
    return data;
  } catch (error) {
    console.error('❌ Error in getStrapiData:', error);
    throw error;
  }
}

export function getStrapiMedia(url: string | null | undefined): string {
  if (!url) {
    console.warn('No URL provided for media');
    return '/placeholder.jpg';
  }
  
  if (url.startsWith('http')) {
    return url;
  }
  
  return `${BASE_URL}${url}`;
}