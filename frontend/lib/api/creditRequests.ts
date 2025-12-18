const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface CreditRequestData {
  amount: number;
  reason: string;
}

interface CreditRequest {
  id: number;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  createdAt: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

// Crear solicitud de créditos
export async function createCreditRequest(
  data: CreditRequestData,
  token: string
): Promise<{ data: CreditRequest; message: string }> {
  const response = await fetch(`${API_URL}/api/credit-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al crear solicitud');
  }

  return response.json();
}

// Obtener mis solicitudes
export async function getMyRequests(
  token: string
): Promise<{ data: CreditRequest[] }> {
  const response = await fetch(`${API_URL}/api/credit-requests/my-requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Error al obtener solicitudes');
  }

  return response.json();
}

// Aprobar solicitud (solo admin)
export async function approveCreditRequest(
  id: number,
  admin_notes: string,
  token: string
): Promise<{ data: CreditRequest; message: string }> {
  const response = await fetch(`${API_URL}/api/credit-requests/${id}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ admin_notes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al aprobar solicitud');
  }

  return response.json();
}

// Rechazar solicitud (solo admin)
export async function rejectCreditRequest(
  id: number,
  admin_notes: string,
  token: string
): Promise<{ data: CreditRequest; message: string }> {
  const response = await fetch(`${API_URL}/api/credit-requests/${id}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ admin_notes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Error al rechazar solicitud');
  }

  return response.json();
}