import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';

interface UserData {
  userId: string;
  username: string;
  email: string;
}

interface Message {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  videoId?: string;
}

export function setupSocketIO(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Almacenamiento temporal de usuarios online
  const onlineUsers = new Map<string, UserData>();

  io.on('connection', (socket) => {
    console.log('🔌 Usuario conectado:', socket.id);

    // Usuario se une al chat
    socket.on('join-chat', (userData: UserData) => {
      socket.data.user = userData;
      onlineUsers.set(socket.id, userData);

      // Notificar a todos que un usuario se unió
      io.emit('user-joined', {
        userId: userData.userId,
        username: userData.username,
        onlineCount: onlineUsers.size,
      });

      // Enviar lista de usuarios online al nuevo usuario
      socket.emit('online-users', Array.from(onlineUsers.values()));

      console.log(`✅ ${userData.username} se unió al chat`);
    });

    // Recibir mensaje del cliente
    socket.on('send-message', (message: Omit<Message, 'id' | 'timestamp'>) => {
      const fullMessage: Message = {
        ...message,
        id: `${Date.now()}-${socket.id}`,
        timestamp: new Date(),
      };

      // Enviar mensaje a TODOS los usuarios (incluyendo el remitente)
      io.emit('new-message', fullMessage);

      console.log(`💬 ${message.username}: ${message.message}`);
    });

    // Usuario está escribiendo
    socket.on('typing-start', (username: string) => {
      socket.broadcast.emit('user-typing', username);
    });

    socket.on('typing-stop', () => {
      socket.broadcast.emit('user-stopped-typing');
    });

    // Usuario se desconecta
    socket.on('disconnect', () => {
      const userData = socket.data.user as UserData;
      if (userData) {
        onlineUsers.delete(socket.id);

        // Notificar a todos que un usuario se fue
        io.emit('user-left', {
          userId: userData.userId,
          username: userData.username,
          onlineCount: onlineUsers.size,
        });

        console.log(`❌ ${userData.username} dejó el chat`);
      }
    });
  });

  return io;
}