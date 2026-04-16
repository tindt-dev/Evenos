type AuthPayload = {
  email: string;
  password: string;
};

type RegisterPayload = AuthPayload & {
  fullName: string;
};

type User = {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
};

export type LoginResponse = {
  access_token: string;
  user: User;
};

export type RegisterResponse = LoginResponse & {
  message: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:3001";

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload.message === "string"
        ? payload.message
        : "Request failed.";
    throw new Error(message);
  }

  return payload as T;
}

export async function register(payload: RegisterPayload) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<RegisterResponse>(response);
}

export async function login(payload: AuthPayload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<LoginResponse>(response);
}
