// Types and interfaces for authentication

export interface StrapiErrorResponse {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details: Record<string, unknown>;
  };
}

export interface StrapiRegisterResponse {
  jwt: string;
  user: StrapiUser;
}

export interface StrapiLoginResponse {
  jwt: string;
  user: StrapiUser;
}

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  phone?: string; // Añadido
  credits?: number; // Añadido
}

export interface SessionPayload {
  userId: number;
  username: string;
  email: string;
  expiresAt: Date;
  [key: string]: any; // Index signature para compatibilidad con JWTPayload
}

export interface FormState {
  errors: {
    email?: string[];
    password?: string[];
    username?: string[];
    phone?: string[]; // Añadido
    confirmPassword?: string[];
    identifier?: string[]; // Para signin
  };
  message?: string;
  data?: {
    jwt: string;
    user: StrapiUser;
  };
}

export interface StrapiValidationError {
  path: string[];
  message: string;
  name: string;
}