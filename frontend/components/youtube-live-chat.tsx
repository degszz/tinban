'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Users, Wifi, WifiOff } from 'lucide-react';
import { useSocketChat } from '@/hooks/useSocketChat';
import { LiveStreamAuctionCard } from '@/components/live-stream-auction-card';

interface CardImage {
  id: number;
  url: string;
  alternativeText: string | null;
}

interface SelectedAuction {
  id: number;
  documentId?: string;
  title: string;
  description?: string;
  image: CardImage | CardImage[];
  Price?: number;
  badge?: string;
  stat: 'active' | 'closed' | 'upcoming';
  quantity?: string;
  measurements?: string;
}

interface YouTubeLiveChatProps {
  youtubeUrl: string;
  username: string;
  userId: string;
  selectedAuction?: SelectedAuction | null;
  userFavorites?: string[];
  initialCredits?: number;
}

// Polling interval for auction changes (10 seconds)
const AUCTION_POLL_INTERVAL = 10000;

export function YouTubeLiveChat({ youtubeUrl, username, userId, selectedAuction, userFavorites = [], initialCredits = 0 }: YouTubeLiveChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Track current auction to detect changes
  const currentAuctionRef = useRef<string | null>(selectedAuction?.title || null);

  // Poll for auction changes every 10 seconds
  useEffect(() => {
    const checkAuctionChange = async () => {
      try {
        const response = await fetch('/api/admin/live-stream', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          const newActiveAuctionId = data.activeAuctionId || null;

          // If auction changed, refresh the page to get new auction data
          if (newActiveAuctionId !== currentAuctionRef.current) {
            console.log('🔄 Auction changed from', currentAuctionRef.current, 'to', newActiveAuctionId);
            currentAuctionRef.current = newActiveAuctionId;
            // Refresh the page to get updated auction data from server
            window.location.reload();
          }
        }
      } catch (error) {
        console.error('Error checking auction changes:', error);
      }
    };

    const interval = setInterval(checkAuctionChange, AUCTION_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Extraer el video ID de la URL de YouTube
  const getYoutubeVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const videoId = getYoutubeVideoId(youtubeUrl);

  // USAR EL HOOK DE SOCKET.IO
  const { messages, sendMessage, onlineUsers, isConnected } = useSocketChat(
    userId,
    username,
    !!videoId
  );

  // Scroll automatico al ultimo mensaje SOLO dentro del contenedor del chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    sendMessage(newMessage);
    setNewMessage('');
  };

  // Verificar si la auction esta en favoritos
  const auctionId = selectedAuction?.documentId || selectedAuction?.id?.toString() || '';
  const isFavorite = userFavorites.includes(auctionId);

  if (!videoId) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">
              URL de YouTube invalida. Por favor, verifica el enlace.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
      {/* Header con indicador de transmision en vivo */}
      <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <span className="font-bold">EN VIVO</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {/* Estado de conexion */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5" />
                <span className="text-sm">Conectado</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5" />
                <span className="text-sm">Desconectado</span>
              </>
            )}
          </div>
          
          {/* Usuarios online 
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>{onlineUsers} {onlineUsers === 1 ? 'espectador' : 'espectadores'}</span>
          </div>
          */}
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-2 ${selectedAuction ? 'lg:grid-cols-4' : 'lg:grid-cols-4'}`}>
        {/* Video de YouTube */}
        <div className={`cols-span-2 ${selectedAuction ? 'md:col-span-3' : 'lg:col-span-3'}`}>
          <Card className="overflow-hidden h-fit">
            <CardContent className="p-0 h-fit">
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`}
                  title="YouTube Live Stream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auction Seleccionada (si existe) */}
        {selectedAuction && (
          <div className="col-span-1">
            <LiveStreamAuctionCard
              key={selectedAuction.documentId || selectedAuction.id}
              auction={selectedAuction}
              userId={userId}
              userName={username}
              initialIsFavorite={isFavorite}
              initialCredits={initialCredits}
            />
          </div>
        )}

        {/* Chat en vivo */}
        <div className="col-span-1 lg:col-span-4">
          <Card className="h-[400px] flex flex-col">
            <CardHeader className="border-b py-3">
              <CardTitle className="text-lg flex items-center gap-2">
                Chat en Vivo
                <span className="text-sm font-normal text-gray-500">
                  ({onlineUsers} online)
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">
                  No hay mensajes aun. Se el primero en escribir!
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.userId === userId ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      msg.userId === userId
                        ? 'bg-blue-600 text-white'
                        : msg.username === 'Sistema'
                        ? 'bg-gray-200 text-gray-800 italic text-center w-full'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.username !== 'Sistema' && (
                      <p className="text-xs font-semibold mb-1">
                        {msg.username}
                      </p>
                    )}
                    <p className="text-sm break-words">{msg.message}</p>
                    <p className="text-[10px] opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input para enviar mensajes */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  type="text"
                  placeholder={isConnected ? "Escribe un mensaje..." : "Conectando..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={!isConnected}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim() || !isConnected}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
