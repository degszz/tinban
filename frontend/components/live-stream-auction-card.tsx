'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gavel, TrendingUp, AlertCircle, ChevronLeft, ChevronRight, Trophy, AlertTriangle } from 'lucide-react';
import { FavoriteButton } from '@/components/favorite-button';
import { placeBidOnAuction, getBidsForAuction } from '@/lib/services/bid-service';
import { getUserCredits } from '@/lib/services/credits-service';
import { getStrapiMedia } from '@/lib/strapi';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

interface LiveStreamAuctionCardProps {
  auction: {
    id: number;
    documentId?: string;
    title: string;
    description?: string;
    image: CardImage | CardImage[] | null | undefined;
    Price?: number;
    badge?: string;
    stat: 'active' | 'closed' | 'upcoming';
    quantity?: string;
    measurements?: string;
  };
  userId: string;
  userName: string;
  initialIsFavorite: boolean;
  initialCredits?: number;
}

// Carousel de imagenes igual que en auctions-section
function CardImageCarousel({ images, title, stat }: {
  images: CardImage[],
  title: string,
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
        return 'En Remate';
      case 'closed':
        return 'Cerrado';
      case 'upcoming':
        return 'Proximamente';
      default:
        return status;
    }
  };

  // Si no hay imagenes validas, mostrar placeholder
  if (!images || images.length === 0) {
    return (
      <div className="relative h-48 bg-gray-200 flex items-center justify-center rounded-t-lg">
        <div className="absolute top-2 left-2 z-10">
          <Badge className={`${getStatusColor(stat)} text-white`}>
            {getStatusText(stat)}
          </Badge>
        </div>
        <span className="text-gray-400">Sin imagen</span>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="overflow-hidden rounded-t-lg" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div key={image?.id || index} className="flex-[0_0_100%]">
              <div className="relative h-[250px] w-full overflow-hidden">
                <img
                  src={getStrapiMedia(image?.url)}
                  alt={image?.alternativeText || `${title} - imagen ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badge de estado */}
      <div className="absolute top-2 left-2 z-10">
        <Badge className={`${getStatusColor(stat)} text-white`}>
          {getStatusText(stat)}
        </Badge>
      </div>

      {/* Botones de navegacion */}
      {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={scrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Indicadores de pagina */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === selectedIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function LiveStreamAuctionCard({
  auction,
  userId,
  userName,
  initialIsFavorite,
  initialCredits = 0,
}: LiveStreamAuctionCardProps) {
  const router = useRouter();

  // Normalizar imagenes - manejar todos los casos posibles
  const normalizeImages = (): CardImage[] => {
    if (!auction.image) return [];
    if (Array.isArray(auction.image)) {
      return auction.image.filter(img => img && img.url);
    }
    if (auction.image && typeof auction.image === 'object' && 'url' in auction.image) {
      return [auction.image];
    }
    return [];
  };

  const images = normalizeImages();
  // Use title as auctionId since that's what we store as activeAuctionId
  const auctionId = auction.title;

  console.log('🖼️ LiveStreamAuctionCard auction.image:', auction.image);
  console.log('🖼️ Normalized images:', images);

  const [currentPrice, setCurrentPrice] = useState(auction.Price || 0);
  const [bidAmount, setBidAmount] = useState('');
  const [bids, setBids] = useState<Bid[]>([]);
  // Usar initialCredits del servidor como valor inicial
  const [userCredits, setUserCredits] = useState(initialCredits);
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Si tenemos initialCredits > 0, no mostrar loading
  const [isLoadingCredits, setIsLoadingCredits] = useState(initialCredits === 0);
  const [showInsufficientCreditsDialog, setShowInsufficientCreditsDialog] = useState(false);
  // Winning/outbid indicators
  const [isWinning, setIsWinning] = useState(false);
  const [wasOutbid, setWasOutbid] = useState(false);
  const previousWinningRef = useRef(false);

  console.log('🔑 LiveStreamAuctionCard initialCredits:', initialCredits, 'userCredits:', userCredits);

  const minIncrement = 100;

  // Polling rapido para el live stream (cada 5 segundos)
  useEffect(() => {
    loadBids();
    // Solo cargar creditos si no tenemos initialCredits
    if (initialCredits === 0) {
      loadUserCredits();
    }

    const interval = setInterval(() => {
      loadBids();
    }, 60000); // 60 segundos para reducir API calls

    return () => clearInterval(interval);
  }, [auctionId, initialCredits]);

  // Escuchar eventos de actualizacion de creditos
  useEffect(() => {
    const handleCreditsUpdate = (event: any) => {
      console.log('Creditos actualizados via evento:', event.detail.credits);
      setUserCredits(event.detail.credits);
    };

    window.addEventListener('creditsUpdated', handleCreditsUpdate);
    return () => window.removeEventListener('creditsUpdated', handleCreditsUpdate);
  }, []);

  const loadBids = async () => {
    try {
      const bidsData = await getBidsForAuction(auctionId);
      if (bidsData && bidsData.length > 0) {
        const sortedBids = bidsData.sort((a: any, b: any) => b.amount - a.amount);
        setBids(sortedBids);
        setCurrentPrice(sortedBids[0].amount);

        const highestBidUserId = sortedBids[0].userId;
        const userIsWinning = highestBidUserId === userId;

        console.log('🏆 Winning check:', { highestBidUserId, userId, userIsWinning, wasWinning: previousWinningRef.current });

        if (previousWinningRef.current && !userIsWinning) {
          setWasOutbid(true);
          setTimeout(() => setWasOutbid(false), 5000);
        }

        setIsWinning(userIsWinning);
        previousWinningRef.current = userIsWinning;

        loadUserCredits();
      } else {
        setBids([]);
        setCurrentPrice(auction.Price || 0);
        setIsWinning(false);
        previousWinningRef.current = false;
      }
    } catch (error) {
      console.error('Error loading bids:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserCredits = async () => {
    try {
      setIsLoadingCredits(true);
      console.log('Cargando creditos del usuario...');
      const credits = await getUserCredits();
      console.log('Creditos obtenidos:', credits);
      setUserCredits(credits);
    } catch (error) {
      console.error('Error loading credits:', error);
    } finally {
      setIsLoadingCredits(false);
    }
  };

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setBidAmount(value);
      setBidError('');
    }
  };

  const handlePlaceBid = async () => {
    const bidValue = parseInt(bidAmount);

    if (!bidAmount || isNaN(bidValue)) {
      setBidError('Ingresa un monto valido');
      return;
    }

    if (bidValue <= currentPrice) {
      setBidError(`La puja debe ser mayor a $${currentPrice.toLocaleString()}`);
      return;
    }

    if (bidValue < currentPrice + minIncrement) {
      setBidError(`El incremento minimo es de $${minIncrement.toLocaleString()}`);
      return;
    }

    if (bidValue > userCredits) {
      setShowInsufficientCreditsDialog(true);
      return;
    }

    setIsSubmitting(true);
    setBidError('');

    try {
      // Live stream bids requieren aprobacion del admin
      const result = await placeBidOnAuction(auctionId, bidValue, auction.title, true);

      if (result.success) {
        if (result.newCredits !== undefined) {
          console.log('Nuevos creditos recibidos:', result.newCredits);
          setUserCredits(result.newCredits);
          window.dispatchEvent(new CustomEvent('creditsUpdated', {
            detail: { credits: result.newCredits }
          }));
        } else {
          // Si no viene newCredits, recargar desde el servidor
          console.log('newCredits no recibido, recargando...');
          await loadUserCredits();
        }

        await loadBids();
        setBidAmount('');
        setBidSuccess(true);
        setTimeout(() => setBidSuccess(false), 3000);
      } else {
        setBidError(result.error || 'Error al realizar la puja');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      setBidError('Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickBid = (increment: number) => {
    const newBid = currentPrice + increment;
    setBidAmount(newBid.toString());
  };

  const isActive = auction.stat === 'active';
  const bidValue = parseInt(bidAmount) || 0;
  const hasInsufficientCredits = bidValue > userCredits && bidValue > 0;

  return (
    <>
      <Card className="flex flex-col overflow-hidden">
        {/* Carousel de imagenes */}
        <CardImageCarousel images={images} title={auction.title} stat={auction.stat}/>

        <CardHeader className="">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2">{auction.title}</CardTitle>
            <FavoriteButton
              auctionId={auctionId}
              initialIsFavorite={initialIsFavorite}
              userId={userId}
              size="icon"
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-3 pt-0">
          {/* Precio actual */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Precio Actual</p>
                {isLoading ? (
                  <div className="h-7 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-2xl font-bold text-green-700">
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

          {/* Indicador de que vas ganando */}
          {isWinning && bids.length > 0 && (
            <div className="bg-green-100 border-2 border-green-500 rounded-lg p-3 flex items-center gap-2 animate-pulse">
              <Trophy className="h-5 w-5 text-green-600" />
              <span className="text-sm font-bold text-green-700">¡VAS GANANDO!</span>
            </div>
          )}
          {/* Indicador de que te superaron */}
          {wasOutbid && (
            <div className="bg-red-100 border-2 border-red-500 rounded-lg p-3 flex items-center gap-2 animate-bounce">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-sm font-bold text-red-700">¡TE HAN SUPERADO!</span>
            </div>
          )}

          {/* Creditos disponibles */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
            <p className="text-xs text-gray-700">
              <span className="font-semibold">Tus creditos:</span>{' '}
              {isLoadingCredits ? (
                <span className="inline-block w-16 h-4 bg-gray-200 animate-pulse rounded"></span>
              ) : (
                <span className="font-bold text-green-600">${userCredits.toLocaleString()}</span>
              )}
            </p>
          </div>

          {/* Sistema de pujas */}
          {isActive ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Tu puja"
                  value={bidAmount}
                  onChange={handleBidChange}
                  className="flex-1 h-9"
                  disabled={isSubmitting}
                />
                <Button
                  onClick={handlePlaceBid}
                  className="bg-green-600 hover:bg-green-700 h-9"
                  disabled={isSubmitting || !bidAmount || hasInsufficientCredits}
                >
                  <Gavel className="h-4 w-4 mr-1" />
                  {isSubmitting ? '...' : 'Pujar'}
                </Button>
              </div>

              {/* Botones rapidos */}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickBid(minIncrement)}
                  className="flex-1 text-xs h-7"
                  disabled={isSubmitting}
                >
                  +${minIncrement}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickBid(minIncrement * 5)}
                  className="flex-1 text-xs h-7"
                  disabled={isSubmitting}
                >
                  +${minIncrement * 5}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickBid(minIncrement * 10)}
                  className="flex-1 text-xs h-7"
                  disabled={isSubmitting}
                >
                  +${minIncrement * 10}
                </Button>
              </div>

              {/* Errores y exito */}
              {bidError && (
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <p className="text-xs text-red-600">{bidError}</p>
                </div>
              )}

              {bidSuccess && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                  <p className="text-xs text-yellow-800 font-medium">
                    Puja enviada. Pendiente de aprobacion.
                  </p>
                </div>
              )}

              {hasInsufficientCredits && (
                <div className="bg-orange-50 border border-orange-200 rounded p-2 flex items-start gap-1">
                  <AlertCircle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-700">
                    Creditos insuficientes. Necesitas ${(bidValue - userCredits).toLocaleString()} mas
                  </p>
                </div>
              )}

              
            </div>
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                {auction.stat === 'closed'
                  ? 'Este remate ha finalizado'
                  : 'Este remate aun no ha comenzado'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de creditos insuficientes */}
      <AlertDialog open={showInsufficientCreditsDialog} onOpenChange={setShowInsufficientCreditsDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Creditos Insuficientes
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>No tienes suficientes creditos para esta puja.</p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Puja:</span> ${bidValue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Creditos:</span> ${userCredits.toLocaleString()}
                </p>
                <p className="text-sm text-orange-700 font-medium mt-2">
                  Necesitas ${(bidValue - userCredits).toLocaleString()} mas
                </p>
              </div>
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
