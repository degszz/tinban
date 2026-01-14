'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Users, Wifi, WifiOff } from 'lucide-react';
import { useSocketChat } from '@/hooks/useSocketChat';

interface YouTubeLiveChatProps {
  youtubeUrl: string;
  username: string;
  userId: string;
}

export function YouTubeLiveChat({ youtubeUrl, username, userId }: YouTubeLiveChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Extraer el video ID de la URL de YouTube
  const getYoutubeVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const videoId = getYoutubeVideoId(youtubeUrl);

  // 🔥 USAR EL HOOK DE SOCKET.IO
  const { messages, sendMessage, onlineUsers, isConnected } = useSocketChat(
    userId,
    username,
    !!videoId
  );

  // Scroll automático al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    // 🔥 ENVIAR MENSAJE A TRAVÉS DE SOCKET.IO
    sendMessage(newMessage);
    setNewMessage('');
  };

  if (!videoId) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">
              URL de YouTube inválida. Por favor, verifica el enlace.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-4">
      {/* Header con indicador de transmisión en vivo */}
      <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <span className="font-bold">EN VIVO</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {/* Estado de conexión */}
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
          {/* Usuarios online */}
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>{onlineUsers} {onlineUsers === 1 ? 'espectador' : 'espectadores'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Video de YouTube */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
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

        {/* Chat en vivo */}
        <div className="lg:col-span-1">
          <Card className="h-[500px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                💬 Chat en Vivo
                <span className="text-sm font-normal text-gray-500">
                  ({onlineUsers} online)
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">
                  No hay mensajes aún. ¡Sé el primero en escribir! 👋
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