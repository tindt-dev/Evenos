import { apiFetch } from "@/shared/lib/api";

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

export async function register(payload: RegisterPayload) {
  return apiFetch<RegisterResponse>("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function login(payload: AuthPayload) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
