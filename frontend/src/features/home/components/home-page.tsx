"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Folders,
  Layers3,
  LogOut,
  Sparkles,
  Ticket,
} from "lucide-react";
import { clearAuthSession, getAuthSession } from "@/shared/lib/auth-session";
import { siteConfig } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

const structureItems = [
  {
    title: "app",
    description: "Routing, layout, metadata, and page entry points.",
    icon: Layers3,
  },
  {
    title: "features",
    description: "Every business flow can grow inside a focused module.",
    icon: Folders,
  },
  {
    title: "shared",
    description: "Reusable UI, config, and utilities stay in one shared layer.",
    icon: Sparkles,
  },
];

export function HomePage() {
  const router = useRouter();
  const session = getAuthSession();

  function handleLogout() {
    clearAuthSession();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="flex-1 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_45%),linear-gradient(180deg,#fcfcf8_0%,#f5f1e8_100%)]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 md:px-10 md:py-16">
        <div className="grid gap-6 rounded-[2rem] border border-black/5 bg-white/85 p-8 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.45)] backdrop-blur md:grid-cols-[1.4fr_0.8fr] md:p-10">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-black/10 bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
              Evenos home
            </span>
            <div className="space-y-4">
              <h1 className="max-w-2xl font-heading text-4xl font-semibold tracking-tight text-stone-950 md:text-6xl">
                Welcome to {siteConfig.name}, {session?.user.fullName ?? "guest"}.
              </h1>
              <p className="max-w-xl text-base leading-7 text-stone-600 md:text-lg">
                You are inside the authenticated Evenos home screen. The account
                was registered in Neon through the backend auth API.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-10 px-4">
                <Link href="/register">
                  Create another account
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-10 px-4"
                onClick={handleLogout}
              >
                Sign out
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>

          <Card className="border border-stone-200/80 bg-stone-50/80 py-0">
            <CardHeader className="border-b border-stone-200/80 py-5">
              <CardTitle>Current session</CardTitle>
              <CardDescription>
                This session is stored after a successful backend login.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    Full name
                  </p>
                  <p className="mt-2 text-lg font-medium text-stone-950">
                    {session?.user.fullName ?? "Unknown"}
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    Email
                  </p>
                  <p className="mt-2 text-lg font-medium text-stone-950">
                    {session?.user.email ?? "Unknown"}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-6 text-stone-600">
                Your JWT token is kept in browser storage so the frontend can
                recognize that you are signed in.
              </p>
            </CardContent>
          </Card>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {structureItems.map(({ title, description, icon: Icon }) => (
            <Card key={title} className="border border-black/5 bg-white/80">
              <CardHeader>
                <div className="mb-3 inline-flex size-10 items-center justify-center rounded-2xl bg-stone-900 text-stone-50">
                  <Icon className="size-5" />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border border-black/5 bg-white/80">
            <CardHeader>
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <CalendarDays className="size-5" />
              </div>
              <CardTitle>Events</CardTitle>
              <CardDescription>
                Upcoming event browsing can become the next real feature module.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-black/5 bg-white/80">
            <CardHeader>
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Ticket className="size-5" />
              </div>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>
                Ticket selection and reservation tracking can be connected next.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border border-black/5 bg-white/80 py-0">
            <CardHeader className="border-b border-stone-200/80 py-5">
              <CardTitle>Next feature</CardTitle>
              <CardDescription>
                Use this placeholder to sketch the next module you want to build.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 py-5">
              <div className="space-y-2">
                <label
                  htmlFor="next-feature"
                  className="text-sm font-medium text-stone-700"
                >
                  Feature name
                </label>
                <Input
                  id="next-feature"
                  placeholder="Example: event details, checkout, profile"
                  defaultValue="event details"
                />
              </div>
              <p className="text-sm leading-6 text-stone-600">
                The browser auth flow is already working once backend and
                frontend are both running.
              </p>
            </CardContent>
          </Card>
        </section>
      </section>
    </main>
  );
}
