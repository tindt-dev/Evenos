"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, LogIn, LogOut, Ticket, UserRound } from "lucide-react";
import { clearAuthSession, useAuthSession } from "@/shared/lib/auth-session";
import { useHydrated } from "@/shared/lib/use-hydrated";
import { cn } from "@/shared/lib/utils";
import { siteConfig } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const isHydrated = useHydrated();
  const session = useAuthSession();
  const isAuthenticated = Boolean(session);
  const displayName = session?.user.fullName?.trim() || session?.user.email || "TÃ i khoáº£n";

  const hideOnAuthPages = pathname === "/login" || pathname === "/register";
  if (hideOnAuthPages) return null;

  function handleLogout() {
    clearAuthSession();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-6 md:px-10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 text-stone-950 hover:bg-stone-100"
            aria-label={siteConfig.name}
          >
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-stone-950 text-white shadow-sm">
              <Ticket className="size-4" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight">
              {siteConfig.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/events"
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-950",
                pathname?.startsWith("/events") ? "bg-stone-100 text-stone-950" : null,
              )}
            >
              <CalendarDays className="size-4" />
              Sự kiện
            </Link>
            <Link
              href="/my/bookings"
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-950",
                pathname?.startsWith("/my/bookings") ? "bg-stone-100 text-stone-950" : null,
              )}
            >
              <Ticket className="size-4" />
              Vé của tôi
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="hidden h-10 px-4 md:inline-flex">
            <Link href="/events">Mua vé</Link>
          </Button>

          {!isHydrated ? (
            <div className="h-10 w-28 rounded-xl border border-stone-200 bg-white/50" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 gap-2 px-4">
                  <UserRound className="size-4" />
                  <span className="max-w-[160px] truncate">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my/bookings">VÃ© cá»§a tÃ´i</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                  <LogOut />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="outline" className="h-10 px-4">
                <Link href="/login">
                  <LogIn className="size-4" />
                  Đăng nhập
                </Link>
              </Button>
              <Button asChild className="hidden h-10 px-4 sm:inline-flex">
                <Link href="/register">Đăng ký</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

