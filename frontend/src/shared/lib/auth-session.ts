import type { LoginResponse } from "@/shared/lib/auth-api";
import { useSyncExternalStore } from "react";

const SESSION_KEY = "evenos.auth.session";
const SESSION_EVENT = "evenos:auth-session";

// React's useSyncExternalStore expects getSnapshot() to return a stable reference
// when the underlying store hasn't changed. If we JSON.parse on every read,
// we produce a new object each time and can trigger an infinite render loop.
let cachedSessionJson: string | null | undefined = undefined;
let cachedSession: LoginResponse | null = null;

function notifyAuthSessionChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function saveAuthSession(session: LoginResponse) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  notifyAuthSessionChanged();
}

export function getAuthSession(): LoginResponse | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(SESSION_KEY);

  // If the raw value hasn't changed, return the cached parsed object to keep
  // reference identity stable across reads.
  if (value === cachedSessionJson) {
    return cachedSession;
  }

  if (!value) {
    cachedSessionJson = value;
    cachedSession = null;
    return null;
  }

  try {
    const parsed = JSON.parse(value) as LoginResponse;
    cachedSessionJson = value;
    cachedSession = parsed;
    return parsed;
  } catch {
    cachedSessionJson = value;
    cachedSession = null;
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
  notifyAuthSessionChanged();
}

export function useAuthSession(): LoginResponse | null {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => {};
      }

      const handler = () => onStoreChange();
      window.addEventListener("storage", handler);
      window.addEventListener(SESSION_EVENT, handler);

      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener(SESSION_EVENT, handler);
      };
    },
    () => getAuthSession(),
    () => null,
  );
}
