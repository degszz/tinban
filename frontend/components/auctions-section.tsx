"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Gavel, TrendingUp, AlertCircle } from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { getStrapiMedia } from "@/lib/strapi";
import { placeBidOnAuction, getBidsForAuction } from "@/lib/services/bid-service";
import { getUserCredits } from "@/lib/services/credits-service";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ⏱️ Intervalo de polling (30 segundos)
const POLLING_INTERVAL = 30000;

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
  timestamp: string;
}

interface CardItem {
  id: number;
  documentId?: string;
  title: string;
  description: string;
  image: CardImage | CardImage[];
  Price?: number;
  link: CardLink;
  badge?: string;
  stat: 'active' | 'closed' | 'upcoming';
  quantity?: string;
  measurements?: string;
}

interface AuctionsSectionProps {
  data: {
    id: string;
    title: string;
    subtitle?: string;
    cards: CardItem[];
  };
  userId?: string;
  userName?: string;
  userFavorites?: string[];
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
              <div className="relative h-full w-full overflow-hidden">
                <img
                  src={getStrapiMedia(image.url)}
                  alt={image.alternativeText || `${title} - imagen ${index + 1}`}
                  className="object-contain w-full h-full"
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

          <div className="absolute bottom-2 top-1 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
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

// Componente para los detalles del producto
function ProductDetails({ quantity, description, measurements }: {
  quantity?: string;
  description?: string;
  measurements?: string;
}) {
  if (!quantity && !description && !measurements) {
    return null;
  }

  return (
    <div className="space-y-2 border-t border-t-border border-b border-b-border py-2.5 my-2">
      {quantity && (
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z"></path>
              <path d="M7 7h10"></path>
              <path d="M7 12h10"></path>
              <path d="M7 17h10"></path>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700">Cantidad</p>
            <p className="text-sm text-gray-600">{quantity}</p>
          </div>
        </div>
      )}

      {description && (
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0"></path>
              <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0"></path>
              <path d="M3 6l0 13"></path>
              <path d="M12 6l0 13"></path>
              <path d="M21 6l0 13"></path>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700">Descripción</p>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      )}

      {measurements && (
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 text-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v4a1 1 0 0 0 1 1h3"></path>
              <path d="M7 7v10"></path>
              <path d="M10 8v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1 -1v-8a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1z"></path>
              <path d="M17 7v4a1 1 0 0 0 1 1h3"></path>
              <path d="M21 7v10"></path>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700">Medidas</p>
            <p className="text-sm text-gray-600">{measurements}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de tarjeta de remate con sistema de pujas y créditos
function AuctionCard({ card, userId, userName, initialIsFavorite, sharedCredits }: { 
  card: CardItem, 
  userId?: string, 
  userName?: string,
  initialIsFavorite: boolean,
  sharedCredits: number
}) {
  const router = useRouter();
  const images = Array.isArray(card.image) ? card.image : [card.image];
  
  const initialPrice = card.Price || 0;
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [bidAmount, setBidAmount] = useState("");
  const [bids, setBids] = useState<Bid[]>([]);
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔑 Usar créditos compartidos del padre
  const [userCredits, setUserCredits] = useState(sharedCredits);
  const [showInsufficientCreditsDialog, setShowInsufficientCreditsDialog] = useState(false);

  const minIncrement = 100;
  const auctionId = card.documentId || card.id.toString();

  // 🔑 Sincronizar créditos con el padre
  useEffect(() => {
    setUserCredits(sharedCredits);
  }, [sharedCredits]);

  // ⏱️ POLLING: Actualizado a 30 segundos (reducido de 10)
  useEffect(() => {
    setIsLoading(true);
    loadBids();

    const interval = setInterval(() => {
      loadBids();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [auctionId]);

  const loadBids = async () => {
    try {
      const bidsData = await getBidsForAuction(auctionId);
      
      if (bidsData && bidsData.length > 0) {
        const sortedBids = bidsData.sort((a: any, b: any) => b.amount - a.amount);
        setBids(sortedBids);
        
        const highestBid = sortedBids[0].amount;
        setCurrentPrice(highestBid);
      } else {
        setBids([]);
        setCurrentPrice(initialPrice);
      }
    } catch (error) {
      console.error("Error loading bids:", error);
      setCurrentPrice(initialPrice);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setBidAmount(value);
      setBidError("");
    }
  };

  const handlePlaceBid = async () => {
    if (!userId) {
      setBidError("Debes iniciar sesión para pujar");
      router.push('/signin');
      return;
    }

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

    if (bidValue > userCredits) {
      setShowInsufficientCreditsDialog(true);
      return;
    }

    setIsSubmitting(true);
    setBidError("");

    try {
      // Subastas normales no requieren aprobacion - se aprueban automaticamente
      const result = await placeBidOnAuction(auctionId, bidValue, card.title, false);

      if (result.success) {
        if (result.newCredits !== undefined) {
          setUserCredits(result.newCredits);
          
          // 🔑 Notificar al padre para actualizar créditos globales
          window.dispatchEvent(new CustomEvent('creditsUpdated', {
            detail: { credits: result.newCredits }
          }));
        }

        await loadBids();
        
        setBidAmount("");
        setBidSuccess(true);
        setTimeout(() => setBidSuccess(false), 3000);
      } else {
        setBidError(result.error || "Error al realizar la puja");
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      setBidError("Error al conectar con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickBid = (increment: number) => {
    const newBid = currentPrice + increment;
    setBidAmount(newBid.toString());
  };

  const isActive = card.stat === 'active';
  const bidValue = parseInt(bidAmount) || 0;
  const hasInsufficientCredits = bidValue > userCredits;

  return (
    <>
      <Card className="overflow-hidden pt-0 hover:shadow-xl max-h-fit transition-shadow duration-300 mx-[20px] md:mx-[30px]">
        <div className="relative">
          <CardImageCarousel
            images={images}
            title={card.title}
            badge={card.badge}
            stat={card.stat}
          />
        </div>

        <CardHeader className="pt-3 pb-0">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl flex-1">{card.title}</CardTitle>
            <FavoriteButton 
              auctionId={auctionId}
              initialIsFavorite={initialIsFavorite}
              userId={userId}
              size="icon"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-3">
          <ProductDetails 
            quantity={card.quantity}
            description={card.description}
            measurements={card.measurements}
          />

          {/* Precio actual */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Precio Actual</p>
                {isLoading ? (
                  <div className="h-9 w-32 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    ${currentPrice.toLocaleString()}
                  </p>
                )}
              </div>
              {bids.length > 0 && !isLoading && (
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
              {userId && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Créditos disponibles:</span> ${userCredits.toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Ingresa tu puja"
                  value={bidAmount}
                  onChange={handleBidChange}
                  className="flex-1"
                  disabled={!isActive || isSubmitting}
                />
                <Button 
                  onClick={handlePlaceBid}
                  className="bg-green-600 hover:bg-green-700 cursor-pointer"
                  disabled={!isActive || isSubmitting || !bidAmount || hasInsufficientCredits}
                >
                  <Gavel className="h-4 w-4 mr-2" />
                  {isSubmitting ? "..." : "Pujar"}
                </Button>
              </div>

              {hasInsufficientCredits && bidAmount && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-orange-800 font-medium">
                      Créditos insuficientes
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Necesitas ${(bidValue - userCredits).toLocaleString()} créditos más para esta puja.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickBid(minIncrement)}
                  className="flex-1 text-xs cursor-pointer"
                  disabled={isSubmitting}
                >
                  +${minIncrement.toLocaleString()}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickBid(minIncrement * 5)}
                  className="flex-1 text-xs cursor-pointer"
                  disabled={isSubmitting}
                >
                  +${(minIncrement * 5).toLocaleString()}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickBid(minIncrement * 10)}
                  className="flex-1 text-xs cursor-pointer"
                  disabled={isSubmitting}
                >
                  +${(minIncrement * 10).toLocaleString()}
                </Button>
              </div>

              {bidError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{bidError}</p>
                </div>
              )}

              {bidSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800 font-medium">
                    ¡Puja realizada con éxito!
                  </p>
                </div>
              )}

              {bids.length > 0 && !isLoading && (
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
                            <p className="font-medium">{bid.userName || 'Usuario'}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(bid.timestamp).toLocaleString('es-AR')}
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


      </Card>

      {/* Dialog de créditos insuficientes */}
      <AlertDialog open={showInsufficientCreditsDialog} onOpenChange={setShowInsufficientCreditsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Créditos Insuficientes
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                No tienes suficientes créditos para realizar esta puja.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Puja solicitada:</span> ${bidValue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Créditos disponibles:</span> ${userCredits.toLocaleString()}
                </p>
                <p className="text-sm text-orange-700 font-medium mt-2">
                  Necesitas ${(bidValue - userCredits).toLocaleString()} créditos más
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Puedes solicitar más créditos desde tu Dashboard.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowInsufficientCreditsDialog(false)}>
              Entendido
            </AlertDialogAction>
            <Button onClick={() => router.push('/dashboard')} variant="default">
              Ir a Dashboard
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function AuctionsSection({ data, userId, userName, userFavorites = [] }: AuctionsSectionProps) {
  // 🔑 Estado compartido de créditos - una sola request
  const [sharedCredits, setSharedCredits] = useState(0);

  // 🔑 Cargar créditos UNA SOLA VEZ al inicio
  useEffect(() => {
    if (userId) {
      loadUserCredits();
      
      // ⏱️ Actualizar créditos cada 30 segundos (reducido de constante)
      const interval = setInterval(loadUserCredits, POLLING_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [userId]);

  // 🔑 Escuchar eventos de actualización de créditos
  useEffect(() => {
    const handleCreditsUpdate = (event: any) => {
      setSharedCredits(event.detail.credits);
    };

    window.addEventListener('creditsUpdated', handleCreditsUpdate);
    return () => window.removeEventListener('creditsUpdated', handleCreditsUpdate);
  }, []);

  const loadUserCredits = async () => {
    try {
      const credits = await getUserCredits();
      setSharedCredits(credits);
    } catch (error) {
      console.error("Error loading credits:", error);
    }
  };

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
          {cards.map((card) => {
            const auctionId = card.documentId || card.id.toString();
            const isFavorite = userFavorites.includes(auctionId);
            
            return (
              <AuctionCard 
                key={card.id} 
                card={card} 
                userId={userId}
                userName={userName}
                initialIsFavorite={isFavorite}
                sharedCredits={sharedCredits}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
