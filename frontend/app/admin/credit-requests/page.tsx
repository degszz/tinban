"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Clock, User, DollarSign } from "lucide-react";

interface CreditRequest {
  id: number;
  documentId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export default function AdminCreditRequestsPage() {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/admin/credit-requests');
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/credit-requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: 'Aprobado desde panel de admin' }),
      });

      if (response.ok) {
        alert('✅ Solicitud aprobada exitosamente');
        loadRequests();
      } else {
        const data = await response.json();
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Error al aprobar solicitud');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Razón del rechazo (opcional):');
    
    setProcessingId(id);
    try {
      const response = await fetch(`/api/admin/credit-requests/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: reason || 'Rechazado' }),
      });

      if (response.ok) {
        alert('✅ Solicitud rechazada');
        loadRequests();
      } else {
        const data = await response.json();
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      alert('❌ Error al rechazar solicitud');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" />Aprobado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><X className="h-3 w-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Solicitudes de Crédito
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona las solicitudes de crédito de los usuarios
          </p>
        </div>

        {/* Solicitudes Pendientes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Pendientes ({pendingRequests.length})
          </h2>
          
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No hay solicitudes pendientes
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="border-yellow-200 dark:border-yellow-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {request.user?.username || 'Usuario desconocido'}
                        </CardTitle>
                        <CardDescription>{request.user?.email}</CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Monto solicitado
                      </p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                        <DollarSign className="h-6 w-6" />
                        {request.amount.toLocaleString()}
                      </p>
                    </div>
                    
                    {request.reason && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Razón:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          {request.reason}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Solicitado: {new Date(request.createdAt).toLocaleString('es-AR')}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Aprobar
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Solicitudes Procesadas */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Historial ({processedRequests.length})
          </h2>
          
          {processedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No hay solicitudes procesadas
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {processedRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {request.user?.username || 'Usuario'}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          ${request.amount.toLocaleString()}
                        </CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
