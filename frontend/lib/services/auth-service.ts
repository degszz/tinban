import {
  StrapiLoginResponse,
  StrapiRegisterResponse,
  StrapiErrorResponse,
} from "@/lib/definitions";

const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

interface RegisterUserProps {
  username: string;
  phone: string;
  email: string;
  password: string;
}

interface LoginUserProps {
  identifier: string;
  password: string;
}

export async function registerUserService(
  userData: RegisterUserProps
): Promise<StrapiRegisterResponse | StrapiErrorResponse> {
  try {
    const response = await fetch(`${baseUrl}/api/auth/local/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      cache: "no-cache",
    });

    return response.json();
  } catch (error) {
    console.error("Registration Service Error:", error);
    throw error;
  }
}

export async function loginUserService(
  credentials: LoginUserProps
): Promise<StrapiLoginResponse | StrapiErrorResponse> {
  try {
    const response = await fetch(`${baseUrl}/api/auth/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      cache: "no-cache",
    });

    return response.json();
  } catch (error) {
    console.error("Login Service Error:", error);
    throw error;
  }
}

export async function getUserMeService(
  jwt: string
): Promise<any | StrapiErrorResponse> {
  try {
    const response = await fetch(`${baseUrl}/api/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      cache: "no-cache",
    });

    return response.json();
  } catch (error) {
    console.error("Get User Service Error:", error);
    throw error;
  }
}
