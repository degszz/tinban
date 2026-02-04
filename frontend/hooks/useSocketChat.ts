import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
}

interface UserJoined {
  userId: string;
  username: string;
  onlineCount: number;
}

export function useSocketChat(userId: string, username: string, enabled: boolean) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);

  // Conectar al servidor Socket.IO
  useEffect(() => {
    if (!enabled || !userId || !username) return;

    const SOCKET_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    // Eventos de conexión
    newSocket.on('connect', () => {
      console.log('✅ Conectado a Socket.IO');
      setIsConnected(true);
      
      // Unirse al chat
      newSocket.emit('join-chat', {
        userId,
        username,
        email: '', // Opcional
      });
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Desconectado de Socket.IO');
      setIsConnected(false);
    });

    // Eventos del chat
    newSocket.on('user-joined', (data: UserJoined) => {
      setOnlineUsers(data.onlineCount);
      
      // Mensaje de sistema
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        userId: 'system',
        username: 'Sistema',
        message: `${data.username} se unió al chat 👋`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    newSocket.on('user-left', (data: UserJoined) => {
      setOnlineUsers(data.onlineCount);
      
      // Mensaje de sistema
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        userId: 'system',
        username: 'Sistema',
        message: `${data.username} dejó el chat 👋`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    newSocket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, {
        ...message,
        timestamp: new Date(message.timestamp),
      }]);
    });

    newSocket.on('bid-approved', (data: { username: string; amount: number; auctionTitle: string }) => {
      const systemMessage: Message = {
        id: `bid-${Date.now()}`,
        userId: 'system',
        username: 'Sistema',
        message: `${data.username} ha pujado $${data.amount.toLocaleString()} por "${data.auctionTitle}" - APROBADA`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, [userId, username, enabled]);

  // Función para enviar mensajes
  const sendMessage = useCallback((message: string) => {
    if (!socket || !message.trim()) return;

    socket.emit('send-message', {
      userId,
      username,
      message: message.trim(),
    });
  }, [socket, userId, username]);

  return {
    messages,
    sendMessage,
    onlineUsers,
    isConnected,
  };
}