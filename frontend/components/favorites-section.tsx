"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, TrendingUp, ChevronLeft, ChevronRight, Gavel, AlertCircle } from "lucide-react";
import { getStrapiMedia } from "@/lib/strapi";
import { FavoriteButton } from "@/components/favorite-button";
import { placeBidOnAuction, getBidsForAuction } from "@/lib/services/bid-service";
import { getUserCredits } from "@/lib/services/credits-service";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CardImage {
  id: number;
  url: string;
  alternativeText: string | null;
}

interface CardLink {
  id: number;
  href: string;
  label: string;
  isExternal: boolean | null;
}

interface CardItem {
  id: number;
  documentId?: string;
  title: string;
  description: string;
  image: CardImage | CardImage[];
  Price?: number;
  link?: CardLink;
  badge?: string;
  stat: 'active' | 'closed' | 'upcoming';
  quantity?: string;
  measurements?: string;
}

interface Bid {
  id: string;
  amount: number;
  userId: string;
  userName: string;
  timestamp: string;
}

interface FavoritesSectionProps {
  favorites: CardItem[];
  userId: string;
  userName?: string;
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
    <div className="relative group ">
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

// Componente de tarjeta de favorito con sistema de pujas
function FavoriteAuctionCard({ card, userId, userName }: { 
  card: CardItem, 
  userId: string, 
  userName?: string
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
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  // Estado de créditos
  const [userCredits, setUserCredits] = useState(0);
  const [showInsufficientCreditsDialog, setShowInsufficientCreditsDialog] = useState(false);

  const minIncrement = 100;
  const auctionId = card.documentId || card.id.toString();

  // Cargar pujas y créditos al montar el componente
  useEffect(() => {
    setIsLoading(true);
    loadBids();
    loadUserCredits();

    // POLLING: Actualizar pujas cada 10 segundos
    const interval = setInterval(() => {
      loadBids();
      loadUserCredits();
    }, 10000);

    // Escuchar actualizaciones de créditos globales
    const handleCreditsUpdate = (event: CustomEvent) => {
      setUserCredits(event.detail.credits);
    };

    window.addEventListener('creditsUpdated' as any, handleCreditsUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('creditsUpdated' as any, handleCreditsUpdate);
    };
  }, [auctionId]);

  const loadUserCredits = async () => {
    const credits = await getUserCredits();
    setUserCredits(credits);
  };

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
      const result = await placeBidOnAuction(auctionId, bidValue, card.title);

      if (result.success) {
        if (result.newCredits !== undefined) {
          setUserCredits(result.newCredits);
          
          window.dispatchEvent(new CustomEvent('creditsUpdated', {
            detail: { credits: result.newCredits }
          }));
        } else {
          await loadUserCredits();
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

  const handleCardClick = (e: React.MouseEvent) => {
    // Evitar abrir el dialog si se hace clic en botones o inputs
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('input') || 
      target.closest('a') ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'A'
    ) {
      return;
    }
    setShowDetailDialog(true);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer" onClick={handleCardClick}>
        <div className="relative">
          <CardImageCarousel
            images={images}
            title={card.title}
            badge={card.badge}
            stat={card.stat}
          />
          
          {/* Botón de favoritos */}
          <div className="absolute top-2 right-2 z-10">
            <FavoriteButton
              auctionId={auctionId}
              initialIsFavorite={true}
              userId={userId}
              size="icon"
            />
          </div>
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-2">{card.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {/* Detalles del producto */}
          <ProductDetails 
            quantity={card.quantity}
            description={card.description}
            measurements={card.measurements}
          />

          {/* Precio actual */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Precio Actual</p>
                {isLoading ? (
                  <div className="h-8 w-28 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    ${currentPrice.toLocaleString()}
                  </p>
                )}
              </div>
              {bids.length > 0 && !isLoading && (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium">{bids.length} pujas</span>
                </div>
              )}
            </div>
          </div>

          {/* Sistema de pujas - solo para remates activos */}
          {isActive ? (
            <div className="space-y-2">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                <p className="text-xs text-gray-700">
                  <span className="font-semibold">Créditos:</span> ${userCredits.toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Tu puja"
                  value={bidAmount}
                  onChange={handleBidChange}
                  className="flex-1 h-9 text-sm"
                  disabled={!isActive || isSubmitting}
                />
                <Button 
                  onClick={handlePlaceBid}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 cursor-pointer"
                  disabled={!isActive || isSubmitting || !bidAmount || hasInsufficientCredits}
                >
                  <Gavel className="h-3 w-3 mr-1" />
                  {isSubmitting ? "..." : "Pujar"}
                </Button>
              </div>

              {hasInsufficientCredits && bidAmount && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-800">
                    Créditos insuficientes. Necesitas ${(bidValue - userCredits).toLocaleString()} más.
                  </p>
                </div>
              )}

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickBid(minIncrement)}
                  className="flex-1 text-xs h-8 cursor-pointer"
                  disabled={isSubmitting}
                >
                  +${minIncrement.toLocaleString()}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickBid(minIncrement * 5)}
                  className="flex-1 text-xs h-8 cursor-pointer"
                  disabled={isSubmitting}
                >
                  +${(minIncrement * 5).toLocaleString()}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickBid(minIncrement * 10)}
                  className="flex-1 text-xs h-8 cursor-pointer"
                  disabled={isSubmitting}
                >
                  +${(minIncrement * 10).toLocaleString()}
                </Button>
              </div>

              {bidError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                  <p className="text-xs text-red-600">{bidError}</p>
                </div>
              )}

              {bidSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                  <p className="text-xs text-green-800 font-medium">
                    ¡Puja realizada con éxito!
                  </p>
                </div>
              )}

              {bids.length > 0 && !isLoading && (
                <div className="border-t pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBidHistory(!showBidHistory)}
                    className="w-full h-8 text-xs"
                  >
                    {showBidHistory ? 'Ocultar' : 'Ver'} historial ({bids.length})
                  </Button>

                  {showBidHistory && (
                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {bids.map((bid) => (
                        <div
                          key={bid.id}
                          className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded"
                        >
                          <div>
                            <p className="font-medium">{bid.userName || 'Usuario'}</p>
                            <p className="text-[10px] text-gray-500">
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
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-xs text-gray-600">
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

      {/* Dialog de Detalle Expandido */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{card.title}</DialogTitle>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Columna Izquierda - Imagen */}
            <div className="space-y-4">
              <CardImageCarousel
                images={images}
                title={card.title}
                badge={card.badge}
                stat={card.stat}
              />
            </div>

            {/* Columna Derecha - Información y Pujas */}
            <div className="space-y-4">
              {/* Detalles del producto */}
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
                      <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
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
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Créditos:</span> ${userCredits.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Tu puja"
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
                      <p className="text-sm text-orange-800">
                        Créditos insuficientes. Necesitas ${(bidValue - userCredits).toLocaleString()} más.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickBid(minIncrement)}
                      className="cursor-pointer"
                      disabled={isSubmitting}
                    >
                      +${minIncrement.toLocaleString()}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickBid(minIncrement * 5)}
                      className="cursor-pointer"
                      disabled={isSubmitting}
                    >
                      +${(minIncrement * 5).toLocaleString()}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickBid(minIncrement * 10)}
                      className="cursor-pointer"
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
                        {showBidHistory ? 'Ocultar' : 'Ver'} historial ({bids.length})
                      </Button>

                      {showBidHistory && (
                        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                          {bids.map((bid) => (
                            <div
                              key={bid.id}
                              className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded"
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


            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function FavoritesSection({ favorites, userId, userName }: FavoritesSectionProps) {
  const [favoritesList, setFavoritesList] = useState(favorites);

  useEffect(() => {
    // Escuchar cambios en favoritos
    const handleFavoritesUpdate = (event: CustomEvent) => {
      const { auctionId, isFavorite } = event.detail;
      
      if (!isFavorite) {
        // Remover de la lista
        setFavoritesList(prev => 
          prev.filter(item => {
            const itemId = item.documentId || item.id.toString();
            return itemId !== auctionId;
          })
        );
      }
    };

    window.addEventListener('favoritesUpdated' as any, handleFavoritesUpdate);
    return () => window.removeEventListener('favoritesUpdated' as any, handleFavoritesUpdate);
  }, []);

  if (favoritesList.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 pt-5">
            <Heart className="h-6 w-6 text-red-500 fill-red-500 " />
            Mis Favoritos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No tienes favoritos
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Agrega remates a favoritos para verlos aquí
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <br />
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          Mis Favoritos ({favoritesList.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoritesList.map((item) => (
            <FavoriteAuctionCard 
              key={item.id} 
              card={item} 
              userId={userId}
              userName={userName}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}