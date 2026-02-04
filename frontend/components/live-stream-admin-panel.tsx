'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Video } from "lucide-react";

import Link from 'next/link';
import {
  Users,
  MessageSquare,
  Gavel,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Save
} from 'lucide-react';
import { useSocketChat } from '@/hooks/useSocketChat';

interface Bid {
  id: string;
  documentId: string;
  userId: string;
  username: string;
  amount: number;
  auctionId: string;
  auctionTitle: string;
  timestamp: string;
  status: 'pending' | 'active' | 'winner' | 'outbid';
}

interface AuctionOption {
  id: number;
  documentId?: string;
  title: string;
  stat: string;
}

interface LiveStreamAdminPanelProps {
  adminUsername: string;
  adminUserId: string;
  initialLiveStreamActive: boolean;
  initialYoutubeLiveUrl: string;
  initialActiveAuctionId: string;
  auctions: AuctionOption[];
}

export function LiveStreamAdminPanel({
  adminUsername,
  adminUserId,
  initialLiveStreamActive,
  initialYoutubeLiveUrl,
  initialActiveAuctionId,
  auctions
}: LiveStreamAdminPanelProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'outbid'>('all');
  const [showChat, setShowChat] = useState(true);

  // Estado del Live Stream
  const [liveStreamActive, setLiveStreamActive] = useState(initialLiveStreamActive);
  const [youtubeLiveUrl, setYoutubeLiveUrl] = useState(initialYoutubeLiveUrl);
  const [activeAuctionId, setActiveAuctionId] = useState(initialActiveAuctionId || 'none');
  const [isSaving, setIsSaving] = useState(false);
  const [isClosingAuction, setIsClosingAuction] = useState(false);
  const [auctionWinner, setAuctionWinner] = useState<{ username: string; amount: number } | null>(null);

  // Hook de Socket.IO para chat
  const { messages, sendMessage, onlineUsers, isConnected } = useSocketChat(
    adminUserId,
    `👑 ${adminUsername} (Admin)`,
    true
  );

  // Socket connection for emitting bid-approved events
  useEffect(() => {
    const SOCKET_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('✅ Admin socket connected for bid events');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Guardar configuracion del Live Stream
  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/live-stream', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          liveStreamActive,
          youtubeLiveUrl,
          activeAuctionId: activeAuctionId === 'none' ? '' : activeAuctionId,
        }),
      });

      if (response.ok) {
        const selectedAuction = auctions.find(a => a.title === activeAuctionId);
        const auctionName = selectedAuction?.title || (activeAuctionId !== 'none' ? activeAuctionId : 'Ninguna');

        if (liveStreamActive) {
          sendMessage(`🎯 Stream activado - Subasta: ${auctionName}`);
        } else {
          sendMessage(`⏸️ Stream pausado`);
        }
        alert('Configuracion guardada correctamente');
      } else {
        alert('Error al guardar configuracion');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error al guardar configuracion');
    } finally {
      setIsSaving(false);
    }
  };

  // Cerrar remate - marcar ganador
  const handleCloseAuction = async () => {
    if (!activeAuctionId || activeAuctionId === 'none') {
      alert('Selecciona una subasta primero');
      return;
    }

    if (!confirm(`¿Estás seguro de cerrar el remate "${activeAuctionId}"? Esto marcará al postor más alto como ganador.`)) {
      return;
    }

    setIsClosingAuction(true);
    try {
      const response = await fetch('/api/admin/live-stream/close-auction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auctionId: activeAuctionId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAuctionWinner({
          username: data.winner.username,
          amount: data.winner.amount,
        });
        sendMessage(`🏆 ¡VENDIDO! Ganador: ${data.winner.username} con $${data.winner.amount.toLocaleString()}`);
        alert(data.message);
        loadBids();
      } else {
        alert(data.error || 'Error al cerrar remate');
      }
    } catch (error) {
      console.error('Error closing auction:', error);
      alert('Error al cerrar remate');
    } finally {
      setIsClosingAuction(false);
    }
  };

  // Cargar bids desde Strapi
  useEffect(() => {
    loadBids();

    // Actualizar cada 10 segundos
    const interval = setInterval(loadBids, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadBids = async () => {
    try {
      const response = await fetch('/api/admin/live-stream/bids', {
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setBids(data.bids || []);
      }
    } catch (error) {
      console.error('Error loading bids:', error);
    }
  };

  const handleApproveBid = async (bidId: string) => {
    try {
      // Find the bid being approved (could be selectedBid or from the list)
      const bidToApprove = selectedBid || bids.find(b => b.documentId === bidId);

      const response = await fetch(`/api/admin/live-stream/bids/${bidId}/approve`, {
        method: 'POST'
      });

      if (response.ok) {
        // Emit bid-approved event via socket
        if (socket && bidToApprove) {
          socket.emit('bid-approved', {
            username: bidToApprove.username,
            amount: bidToApprove.amount,
            auctionTitle: bidToApprove.auctionTitle,
          });
        }
        // Enviar mensaje al chat
        sendMessage(`✅ Puja de $${bidToApprove?.amount?.toLocaleString()} APROBADA`);
        loadBids();
        setSelectedBid(null);
      }
    } catch (error) {
      console.error('Error approving bid:', error);
    }
  };

  const handleRejectBid = async (bidId: string) => {
    try {
      const response = await fetch(`/api/admin/live-stream/bids/${bidId}/reject`, {
        method: 'POST'
      });

      if (response.ok) {
        // Enviar mensaje al chat
        sendMessage(`❌ Puja rechazada`);
        loadBids();
        setSelectedBid(null);
      }
    } catch (error) {
      console.error('Error rejecting bid:', error);
    }
  };

  const sendAdminMessage = (message: string) => {
    sendMessage(`📢 ADMIN: ${message}`);
  };

  // Filtrar bids primero por la subasta activa del live stream
  const liveStreamBids = activeAuctionId && activeAuctionId !== 'none'
    ? bids.filter(bid => bid.auctionId === activeAuctionId)
    : bids;

  const filteredBids = liveStreamBids.filter(bid => {
    if (filterStatus === 'all') return true;
    return bid.status === filterStatus;
  });

  const pendingBidsCount = liveStreamBids.filter(b => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-[#000] rounded-lg p-6 w-fit flex justify-start items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Panel de Control del Directo
            </h1>
            <p >
              Gestiona las pujas y el chat del Directo en vivo
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
              <Button asChild variant="outline" className="w-full k">
                <Link href="/">Ver Subastas</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">☰ Menu</Link>
              </Button>
              {/* ADMIN */}
              <Button asChild className="w-full hover:scale-110 transition-all duration-200">
                <Link href="/admin/credit-requests">💰 Creditos</Link>
              </Button>
            </div>
          </div>
          <div className="hidden sm:block">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg ml-20 lg:ml-0">
                  <Video className="h-16 w-16 text-yellow-500" />
              </div>
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Espectadores</p>
                  <p className="text-2xl font-bold">{onlineUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mensajes</p>
                  <p className="text-2xl font-bold">{messages.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pujas Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingBidsCount}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Pujas</p>
                  <p className="text-2xl font-bold">{bids.length}</p>
                </div>
                <Gavel className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuracion del Live Stream */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 pt-4">
              🎯 Configuracion del Directo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estado del Stream */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="stream-active" className="text-base font-semibold">
                  Estado del Directo
                </Label>
                <p className="text-sm text-gray-500">
                  {liveStreamActive ? 'El directo esta visible para los usuarios' : 'El directo esta oculto'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${liveStreamActive ? 'text-green-600' : 'text-gray-500'}`}>
                  {liveStreamActive ? 'EN VIVO' : 'APAGADO'}
                </span>
                <Switch
                  id="stream-active"
                  checked={liveStreamActive}
                  onCheckedChange={setLiveStreamActive}
                />
              </div>
            </div>

            {/* URL de YouTube */}
            <div className="space-y-2">
              <Label htmlFor="youtube-url">LINK de YouTube</Label>
              <Input
                id="youtube-url"
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeLiveUrl}
                onChange={(e) => setYoutubeLiveUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Ingresa el LINK del directo de Youtube
              </p>
            </div>

            {/* Selector de Subasta */}
            <div className="space-y-2">
              <Label htmlFor="auction-select">Lote Activa</Label>
              <Select
                value={activeAuctionId}
                onValueChange={setActiveAuctionId}
              >
                <SelectTrigger id="auction-select">
                  <SelectValue placeholder="Selecciona una subasta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin lote seleccionado</SelectItem>
                  {auctions
                    .filter((a) => a.title)
                    .map((auction) => (
                      <SelectItem
                        key={auction.id}
                        value={auction.title}
                      >
                        {auction.title} ({auction.stat === 'active' ? 'Activa' : auction.stat === 'closed' ? 'Cerrada' : 'Proximamente'})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Esta subasta se mostrara junto al directo en vivo
              </p>
            </div>

            {/* Botones de Accion */}
            <div className="flex justify-between pt-4 border-t gap-4">
              <Button
                onClick={handleCloseAuction}
                disabled={isClosingAuction || !activeAuctionId || activeAuctionId === 'none'}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Gavel className="h-4 w-4 mr-2" />
                {isClosingAuction ? 'Cerrando...' : 'Cerrar Remate'}
              </Button>
              <Button
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Guardando...' : 'Guardar Configuracion'}
              </Button>
            </div>

            {/* Winner notification */}
            {auctionWinner && (
              <div className="bg-green-50 border border-green-300 rounded-lg p-4 mt-4">
                <p className="text-lg font-bold text-green-800 flex items-center gap-2">
                  🏆 ¡Remate Cerrado!
                </p>
                <p className="text-green-700">
                  Ganador: <span className="font-semibold">{auctionWinner.username}</span>
                </p>
                <p className="text-green-700">
                  Monto: <span className="font-bold">${auctionWinner.amount.toLocaleString()}</span>
                </p>
              </div>
            )}

            {/* Resumen de configuracion */}
            {(liveStreamActive || (activeAuctionId && activeAuctionId !== 'none')) && (
              <div className={`p-4 rounded-lg border ${liveStreamActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <p className="text-sm font-semibold mb-2">
                  {liveStreamActive ? '✅ Directo Activo' : '⏸️ Directo Pausado'}
                </p>
                {youtubeLiveUrl && (
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">YouTube:</span> {youtubeLiveUrl.substring(0, 50)}...
                  </p>
                )}
                {activeAuctionId && activeAuctionId !== 'none' && (
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Lote:</span> {activeAuctionId}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Pujas */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Pujas del Live Stream
                  {activeAuctionId && activeAuctionId !== 'none' && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {activeAuctionId}
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex gap-2 pt-3">
                  <Button
                    size="sm"
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('all')}
                  >
                    Todas
                  </Button>
                  <Button
                    size="sm"
                    variant={filterStatus === 'pending' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('pending')}
                  >
                    Pendientes ({pendingBidsCount})
                  </Button>
                  <Button
                    size="sm"
                    variant={filterStatus === 'active' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('active')}
                  >
                    Aprobadas
                  </Button>
                  <Button
                    size="sm"
                    variant={filterStatus === 'outbid' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('outbid')}
                  >
                    Rechazadas
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredBids.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Gavel className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No hay pujas {filterStatus !== 'all' ? filterStatus : 'aún'}</p>
                  </div>
                ) : (
                  filteredBids.map((bid) => (
                    <Card
                      key={bid.id}
                      className={`cursor-pointer transition-all ${selectedBid?.id === bid.id
                        ? 'ring-2 ring-blue-500'
                        : 'hover:shadow-md'
                        }`}
                      onClick={() => setSelectedBid(bid)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                className={
                                  bid.status === 'pending'
                                    ? 'bg-orange-500'
                                    : bid.status === 'active'
                                      ? 'bg-green-500'
                                      : bid.status === 'winner'
                                        ? 'bg-purple-500'
                                        : 'bg-red-500'
                                }
                              >
                                {bid.status === 'pending' ? '⏳ Pendiente' :
                                  bid.status === 'active' ? '✅ Aprobada' :
                                    bid.status === 'winner' ? '🏆 Ganador' :
                                      '❌ Rechazada'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(bid.timestamp).toLocaleString('es-AR')}
                              </span>
                            </div>
                            <p className="font-semibold text-lg">
                              {bid.username}
                            </p>
                            <p className="text-sm text-gray-600">
                              {bid.auctionTitle}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              ${bid.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {bid.status === 'pending' && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApproveBid(bid.documentId);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectBid(bid.documentId);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between pt-3">
                <CardTitle className="flex items-center gap-2 ">
                  <MessageSquare className="h-5 w-5" />
                  Chat en Vivo
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowChat(!showChat)}
                >
                  {showChat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-600">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </CardHeader>
            {showChat && (
              <CardContent>
                <div className="space-y-4">
                  {/* Mensajes */}
                  <div className="bg-gray-50 rounded-lg p-4 h-[400px] overflow-y-auto space-y-2">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2 rounded-lg ${msg.username.includes('Admin')
                          ? 'bg-purple-100 border border-purple-300'
                          : msg.username === 'Sistema'
                            ? 'bg-gray-200 text-center italic'
                            : 'bg-white'
                          }`}
                      >
                        <p className="text-xs font-semibold text-gray-700">
                          {msg.username}
                        </p>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-[10px] text-gray-500">
                          {msg.timestamp.toLocaleTimeString('es-AR')}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Quick Messages */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600">Mensajes Rápidos:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendAdminMessage('El remate está por comenzar')}
                      >
                        🎬 Inicio
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendAdminMessage('Última oportunidad para pujar')}
                      >
                        ⚠️ Última
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendAdminMessage('Vendido!')}
                      >
                        ✅ Vendido
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendAdminMessage('Gracias por participar')}
                      >
                        👋 Gracias
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}