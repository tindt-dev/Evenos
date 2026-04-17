"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, MapPin, Search, Ticket } from "lucide-react";
import { getEvents, type EventItem } from "@/shared/lib/events-api";
import { formatDateTimeVi, formatMoneyVnd } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { siteConfig } from "@/shared/config/site";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

function getStartingPrice(event: EventItem) {
  const prices = event.ticketTypes.map((ticket) => Number(ticket.price));
  const min = prices.length ? Math.min(...prices.filter(Number.isFinite)) : NaN;
  return Number.isFinite(min) ? min : null;
}

const categoryOrder = ["Âm nhạc", "Giải trí", "Lễ hội", "Hội thảo", "Thể thao", "Triển lãm"];

export function LandingPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Tất cả");

  const categories = useMemo(() => {
    const unique = Array.from(new Set(events.map((event) => event.category))).filter(Boolean);
    unique.sort((a, b) => {
      const ia = categoryOrder.indexOf(a);
      const ib = categoryOrder.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b, "vi");
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return ["Tất cả", ...unique];
  }, [events]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return events.filter((event) => {
      const matchesCategory = activeCategory === "Tất cả" || event.category === activeCategory;
      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;
      const haystack = `${event.title} ${event.location} ${event.category}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [events, query, activeCategory]);

  const featured = filtered.slice(0, 6);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const response = await getEvents();
        if (isCancelled) return;
        setEvents(response);
      } catch (caughtError) {
        if (isCancelled) return;
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Không tải được danh sách sự kiện.";
        setError(message);
      } finally {
        if (isCancelled) return;
        setIsLoading(false);
      }
    }

    void load();
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <main className="flex-1 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_45%),linear-gradient(180deg,#fcfcf8_0%,#f5f1e8_100%)]">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-[1.25fr_0.75fr] md:gap-10">
          <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/85 shadow-[0_25px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
            <div className="relative p-7 md:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.20),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.08),transparent_50%)]" />
              <div className="relative space-y-6">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-sm text-stone-700">
                  <Ticket className="size-4" />
                  Nền tảng đặt vé
                </div>
                <div className="space-y-3">
                  <h1 className="font-heading text-4xl font-semibold tracking-tight text-stone-950 md:text-6xl">
                    {siteConfig.name}
                    <span className="text-amber-600">.</span>
                  </h1>
                  <p className="max-w-xl text-base leading-7 text-stone-600 md:text-lg">
                    {siteConfig.description} Chọn vé, giữ vé có thời hạn, thanh toán
                    giả lập và nhận xác nhận ngay.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Tìm sự kiện theo tên, địa điểm, danh mục..."
                      className="h-11 rounded-2xl pl-9"
                    />
                  </div>
                  <Button asChild className="h-11 rounded-2xl px-6">
                    <Link href="/events">
                      Xem tất cả
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={cn(
                        "rounded-full border px-3 py-1 text-sm transition",
                        activeCategory === category
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-200 bg-white/70 text-stone-700 hover:border-stone-300",
                      )}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Card className="border border-black/5 bg-white/80 py-0">
            <CardHeader className="border-b border-stone-200/80 py-6">
              <CardTitle>Quick links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 py-6">
              <Button
                asChild
                variant="outline"
                className="h-11 w-full justify-between rounded-2xl px-5"
              >
                <Link href="/events">
                  Danh sách sự kiện
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 w-full justify-between rounded-2xl px-5"
              >
                <Link href="/my/bookings">
                  Vé của tôi
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Tip: dùng tài khoản seed để test nhanh. <br />
                <span className="font-medium">attendee@evenos.dev</span> /{" "}
                <span className="font-medium">Evenos@123</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 flex items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-stone-950">
              Sự kiện nổi bật
            </h2>
            <p className="text-sm text-stone-600">
              {activeCategory === "Tất cả"
                ? "Tất cả danh mục."
                : `Danh mục: ${activeCategory}.`}
            </p>
          </div>
          <Button asChild variant="outline" className="hidden h-10 px-5 md:inline-flex">
            <Link href="/events">Xem thêm</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-black/5 bg-white/70 p-6 text-stone-600">
            Đang tải sự kiện...
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        ) : featured.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-black/5 bg-white/70 p-6 text-stone-600">
            Không có sự kiện phù hợp.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {featured.map((event) => {
              const startingPrice = getStartingPrice(event);
              return (
                <Card key={event.id} className="border border-black/5 bg-white/85">
                  <div className="flex gap-4 p-4 md:p-5">
                    <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-black/5 bg-stone-100 md:h-28 md:w-28">
                      {event.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.30),transparent_55%),linear-gradient(180deg,#0f172a_0%,#1f2937_100%)]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <CardHeader className="space-y-2 p-0">
                        <div className="flex items-start justify-between gap-4">
                          <CardTitle className="text-xl text-stone-950">
                            {event.title}
                          </CardTitle>
                          {startingPrice !== null ? (
                            <span className="shrink-0 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">
                              Từ {formatMoneyVnd(startingPrice)}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex flex-col gap-2 text-sm text-stone-600 sm:flex-row sm:items-center sm:gap-4">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="size-4" />
                            {formatDateTimeVi(event.startDate)}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="size-4" />
                            {event.location}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="mt-3 flex items-center justify-between gap-4 p-0">
                        <p className="line-clamp-2 text-sm leading-6 text-stone-600">
                          {event.description}
                        </p>
                        <Button asChild className="h-9 px-4">
                          <Link href={`/events/${event.id}`}>Xem</Link>
                        </Button>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

