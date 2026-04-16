"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HomePage } from "@/features/home/components/home-page";
import { getAuthSession } from "@/shared/lib/auth-session";
import { Button } from "@/shared/ui/button";

export function HomeEntry() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(Boolean(getAuthSession()));
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-600">
          Loading Evenos...
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_45%),linear-gradient(180deg,#fcfcf8_0%,#f5f1e8_100%)] px-6 py-10">
        <div className="w-full max-w-3xl rounded-[2rem] border border-black/5 bg-white/85 p-8 text-center shadow-[0_25px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
          <span className="inline-flex rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-sm text-stone-700">
            Evenos preview
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-stone-950 md:text-5xl">
            Sign in before entering the Evenos home screen.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-stone-600">
            Register through the backend API, sign in, and return here as an
            authenticated user.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className="h-10 px-5">
              <Link href="/register">Create account</Link>
            </Button>
            <Button asChild variant="outline" className="h-10 px-5">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return <HomePage />;
}
