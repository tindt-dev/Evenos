"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CalendarDays, MapPin, Ticket, User } from "lucide-react";
import { getAuthSession } from "@/shared/lib/auth-session";
import { getEventById, type EventItem } from "@/shared/lib/events-api";
import { formatDateTimeVi, formatMoneyVnd } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

export default function EventDetailRoute() {
  const router = useRouter();
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const organizerLabel = useMemo(() => {
    if (!event) return "";
    return event.creator.fullName?.trim() || event.creator.email;
  }, [event]);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const response = await getEventById(eventId);
        if (isCancelled) return;
        setEvent(response);
      } catch (caughtError) {
        if (isCancelled) return;
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "Không tải được sự kiện.";
        setError(message);
      } finally {
        if (isCancelled) return;
        setIsLoading(false);
      }
    }

    if (eventId) {
      void load();
    }

    return () => {
      isCancelled = true;
    };
  }, [eventId]);

  function handleBuyNow() {
    const session = getAuthSession();
    const next = `/events/${eventId}/buy`;

    if (!session) {
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    router.push(next);
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-600">
          Đang tải sự kiện...
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="flex-1 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_45%),linear-gradient(180deg,#fcfcf8_0%,#f5f1e8_100%)]">
        <section className="mx-auto w-full max-w-4xl px-6 py-12 md:px-10 md:py-16">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error || "Sự kiện không tồn tại."}
          </div>
          <div className="mt-6">
            <Button asChild variant="outline" className="h-10 px-5">
              <Link href="/events">Quay lại danh sách</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_45%),linear-gradient(180deg,#fcfcf8_0%,#f5f1e8_100%)]">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/85 shadow-[0_25px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="relative">
            {event.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.imageUrl}
                alt={event.title}
                className="h-72 w-full object-cover md:h-96"
              />
            ) : (
              <div className="h-72 w-full bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.15),transparent_55%),linear-gradient(180deg,#0f172a_0%,#1f2937_100%)] md:h-96" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="space-y-3">
                  <span className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white">
                    {event.category}
                  </span>
                  <h1 className="font-heading text-3xl font-semibold tracking-tight text-white md:text-5xl">
                    {event.title}
                  </h1>
                  <div className="flex flex-col gap-2 text-sm text-white/90 sm:flex-row sm:items-center sm:gap-4">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="size-4" />
                      {formatDateTimeVi(event.startDate)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="size-4" />
                      {event.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleBuyNow}
                    className="h-10 px-5 bg-amber-500 text-stone-950 hover:bg-amber-400"
                  >
                    <Ticket className="size-4" />
                    Mua vé ngay
                  </Button>
                  <Button asChild variant="outline" className="h-10 px-5 bg-white/10 text-white hover:bg-white/15">
                    <Link href="/events">Danh sách</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:gap-10 md:p-10">
            <div className="space-y-6">
              <Card className="border border-black/5 bg-white/80">
                <CardHeader>
                  <CardTitle className="text-lg">Mô tả sự kiện</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-7 text-stone-700">
                  <p className="whitespace-pre-wrap">{event.description}</p>
                </CardContent>
              </Card>

              <Card className="border border-black/5 bg-white/80">
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin ban tổ chức</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-stone-700">
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-stone-500" />
                    <span>{organizerLabel}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-black/5 bg-white/80">
              <CardHeader>
                <CardTitle className="text-lg">Các loại vé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.ticketTypes.length === 0 ? (
                  <p className="text-sm text-stone-600">Sự kiện chưa có vé.</p>
                ) : (
                  <div className="space-y-3">
                    {event.ticketTypes.map((ticketType, index) => (
                      <div key={ticketType.id}>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-medium text-stone-950">
                              {ticketType.name}
                            </p>
                            <p className="mt-1 text-xs text-stone-600">
                              Còn lại: {ticketType.available}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-stone-950">
                            {formatMoneyVnd(ticketType.price)}
                          </p>
                        </div>
                        {index < event.ticketTypes.length - 1 ? (
                          <Separator className="mt-3" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleBuyNow}
                  className="mt-2 h-10 w-full bg-amber-500 text-stone-950 hover:bg-amber-400"
                >
                  Mua vé ngay
                </Button>

                <p className="text-xs leading-5 text-stone-600">
                  Lưu ý: giữ vé trong thời gian giới hạn. Nếu chưa đăng nhập, bạn
                  sẽ được chuyển qua trang đăng nhập trước khi đặt vé.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}

