import Link from 'next/link';
import { Radio, ArrowRight } from 'lucide-react';

interface LiveStreamBannerProps {
  auctionTitle?: string;
}

export function LiveStreamBanner({ auctionTitle }: LiveStreamBannerProps) {
  return (
    <section className="py-4 bg-gradient-to-r from-red-600 to-red-700">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/live" className="block">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <Radio className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-lg">EN VIVO AHORA</p>
                {auctionTitle && (
                  <p className="text-red-100 text-sm">Subastando: {auctionTitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg">
              <span className="font-semibold">Ver Directo</span>
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
