"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Gavel, TrendingUp } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { getStrapiMedia } from "@/lib/strapi";

interface CardLink {
  id: number;
  href: string;
  label: string;
  isExternal: boolean | null;
}

interface CardImage {
  id: number;
  url: string;
  alternativeText: string | null;
}

interface Bid {
  id: string;
  amount: number;
  userId: string;
  userName: string;
  timestamp: Date;
}

interface CardItem {
  id: number;
  title: string;
  description: string;
  image: CardImage | CardImage[];
  price?: number;
  link: CardLink;
  badge?: string;
  stat: 'active' | 'closed' | 'upcoming';
}

interface AuctionsSectionProps {
  data: {
    id: string;
    title: string;
    subtitle?: string;
    cards: CardItem[];
  };
}

// Componente de Carousel para las imágenes
function CardImageCarousel({ images, title, badge, stat }: {
  images: CardImage[],
  title: string,
  badge?: string,
  stat: string
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'closed':
        return 'bg-red-500';
      case 'upcoming':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'closed':
        return 'Cerrado';
      case 'upcoming':
        return 'Próximamente';
      default:
        return status;
    }
  };

  return (
    <div className="relative group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div key={image.id || index} className="flex-[0_0_100%]">
              <div className="relative max-h-[300px] w-full overflow-hidden">
                <img
                  src={getStrapiMedia(image.url)}
                  alt={image.alternativeText || `${title} - imagen ${index + 1}`}
                  className="object-fit w-full max-h-[350px]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-2 left-2 flex gap-2 z-10">
        {badge && (
          <Badge variant="secondary" className="bg-yellow-500 text-white">
            {badge}
          </Badge>
        )}
        <Badge className={getStatusColor(stat)}>
          {getStatusText(stat)}
        </Badge>
      </div>

      {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 h-8 w-8"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 h-8 w-8"
            onClick={scrollNext}
            disabled={!canScrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === selectedIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/75'
                }`}
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Componente de tarjeta de remate con sistema de pujas
function AuctionCard({ card }: { card: CardItem }) {
  const images = Array.isArray(card.image) ? card.image : [card.image];
  
  // Usar 0 como valor por defecto si price no existe
  const initialPrice = card.price || 0;
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [bidAmount, setBidAmount] = useState("");
  const [bids, setBids] = useState<Bid[]>([]);
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState(false);

  const minIncrement = 100; // Incremento mínimo para pujar

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setBidAmount(value);
      setBidError("");
    }
  };

  const handlePlaceBid = () => {
    const bidValue = parseInt(bidAmount);
    
    if (!bidAmount || isNaN(bidValue)) {
      setBidError("Ingresa un monto válido");
      return;
    }

    if (bidValue <= currentPrice) {
      setBidError(`La puja debe ser mayor a $${currentPrice.toLocaleString()}`);
      return;
    }

    if (bidValue < currentPrice + minIncrement) {
      setBidError(`El incremento mínimo es de $${minIncrement.toLocaleString()}`);
      return;
    }

    // Simular usuario (en producción, esto vendría de la autenticación)
    const newBid: Bid = {
      id: Date.now().toString(),
      amount: bidValue,
      userId: "user123",
      userName: "Usuario",
      timestamp: new Date()
    };

    setBids([newBid, ...bids]);
    setCurrentPrice(bidValue);
    setBidAmount("");
    setBidError("");
    setBidSuccess(true);

    // Aquí iría la llamada a tu API de Strapi para guardar la puja
    // saveBidToStrapi(card.id, bidValue);

    setTimeout(() => setBidSuccess(false), 3000);
  };

  const handleQuickBid = (increment: number) => {
    const newBid = currentPrice + increment;
    setBidAmount(newBid.toString());
  };

  const isActive = card.stat === 'active';

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <CardImageCarousel
        images={images}
        title={card.title}
        badge={card.badge}
        stat={card.stat}
      />

      <CardHeader>
        <CardTitle className="text-xl">{card.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {card.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Precio actual */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Precio Actual</p>
              <p className="text-3xl font-bold text-gray-900">
                ${currentPrice.toLocaleString()}
              </p>
            </div>
            {bids.length > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">{bids.length} pujas</span>
              </div>
            )}
          </div>
        </div>

        {/* Sistema de pujas - solo para remates activos */}
        {isActive ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ingresa tu puja"
                value={bidAmount}
                onChange={handleBidChange}
                className="flex-1"
                disabled={!isActive}
              />
              <Button 
                onClick={handlePlaceBid}
                className="bg-green-600 hover:bg-green-700"
                disabled={!isActive}
              >
                <Gavel className="h-4 w-4 mr-2" />
                Pujar
              </Button>
            </div>

            {/* Botones de puja rápida */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickBid(minIncrement)}
                className="flex-1 text-xs"
              >
                +${minIncrement.toLocaleString()}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickBid(minIncrement * 5)}
                className="flex-1 text-xs"
              >
                +${(minIncrement * 5).toLocaleString()}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickBid(minIncrement * 10)}
                className="flex-1 text-xs"
              >
                +${(minIncrement * 10).toLocaleString()}
              </Button>
            </div>

            {bidError && (
              <p className="text-sm text-red-600">{bidError}</p>
            )}

            {bidSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 font-medium">
                  ¡Puja realizada con éxito!
                </p>
              </div>
            )}

            {/* Historial de pujas */}
            {bids.length > 0 && (
              <div className="border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBidHistory(!showBidHistory)}
                  className="w-full"
                >
                  {showBidHistory ? 'Ocultar' : 'Ver'} historial de pujas ({bids.length})
                </Button>

                {showBidHistory && (
                  <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                    {bids.map((bid) => (
                      <div
                        key={bid.id}
                        className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                      >
                        <div>
                          <p className="font-medium">{bid.userName}</p>
                          <p className="text-xs text-gray-500">
                            {bid.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <p className="font-bold text-green-600">
                          ${bid.amount.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600">
              {card.stat === 'closed' 
                ? 'Este remate ha finalizado' 
                : 'Este remate aún no ha comenzado'}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        {card.link && (
          <a
            href={card.link.href}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
          >
            {card.link.label}
          </a>
        )}
      </CardFooter>
    </Card>
  );
}

export function AuctionsSection({ data }: AuctionsSectionProps) {
  if (!data || !data.cards || data.cards.length === 0) {
    return null;
  }

  const { title, subtitle, cards } = data;

  return (
    <section id="auctions" className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <AuctionCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}