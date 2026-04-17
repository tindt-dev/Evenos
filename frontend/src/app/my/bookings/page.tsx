"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { getAuthSession } from "@/shared/lib/auth-session";
import { getMyBookings, type Booking } from "@/shared/lib/bookings-api";
import { formatDateTimeVi, formatMoneyVnd } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export default function MyBookingsRoute() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.push(`/login?next=${encodeURIComponent("/my/bookings")}`);
      return;
    }

    let isCancelled = false;
    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const response = await getMyBookings();
        if (isCancelled) return;
        setBookings(response);
      } catch (caughtError) {
        if (isCancelled) return;
        const message =
          caughtError instanceof Error ? caughtError.message : "Không tải được vé.";
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
  }, [router]);

  return (
    <main className="flex-1 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_45%),linear-gradient(180deg,#fcfcf8_0%,#f5f1e8_100%)]">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-sm text-stone-700">
              Tài khoản
            </span>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
              Vé của tôi
            </h1>
            <p className="text-sm text-stone-600">
              Danh sách booking đã đặt (PENDING/CONFIRMED/EXPIRED...).
            </p>
          </div>

          <Button asChild variant="outline" className="hidden h-10 px-5 md:inline-flex">
            <Link href="/events">Mua vé thêm</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-8 rounded-2xl border border-black/5 bg-white/70 p-6 text-stone-600">
            Đang tải vé...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-black/5 bg-white/70 p-6 text-stone-600">
            Bạn chưa có booking nào.{" "}
            <Link className="font-medium underline underline-offset-4" href="/events">
              Xem sự kiện
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {bookings.map((booking) => (
              <Card key={booking.id} className="border border-black/5 bg-white/85">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg text-stone-950">
                      {booking.event?.title ?? booking.eventId}
                    </CardTitle>
                    <span className="shrink-0 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-stone-600 sm:flex-row sm:items-center sm:gap-4">
                    {booking.event?.startDate ? (
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays className="size-4" />
                        {formatDateTimeVi(booking.event.startDate)}
                      </span>
                    ) : null}
                    {booking.event?.location ? (
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="size-4" />
                        {booking.event.location}
                      </span>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">Vé</span>
                    <span className="font-medium text-stone-950">
                      {booking.ticketType?.name ?? booking.ticketTypeId} x{booking.quantity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-stone-600">Tổng tiền</span>
                    <span className="font-semibold text-stone-950">
                      {formatMoneyVnd(booking.totalPrice)}
                    </span>
                  </div>
                  <Button asChild variant="outline" className="h-10 w-full">
                    <Link href={`/events/${booking.eventId}`}>
                      <Ticket className="size-4" />
                      Xem sự kiện
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

