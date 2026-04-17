"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  Clock,
  CreditCard,
  MapPin,
  Ticket,
} from "lucide-react";
import { getAuthSession } from "@/shared/lib/auth-session";
import { createBookingHold, payBooking, updateBookingContact, type Booking } from "@/shared/lib/bookings-api";
import { getEventById, type EventItem } from "@/shared/lib/events-api";
import { formatCountdown, formatDateTimeVi, formatMoneyVnd } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";

type PaymentMethod = "MOMO" | "ZALOPAY" | "ATM" | "CARD";

const paymentLabels: Record<PaymentMethod, string> = {
  MOMO: "Momo",
  ZALOPAY: "ZaloPay",
  ATM: "ATM",
  CARD: "Visa/Mastercard",
};

export default function BuyTicketRoute() {
  const router = useRouter();
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [step, setStep] = useState<4 | 5 | 6 | 7>(4);
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MOMO");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [holdMsLeft, setHoldMsLeft] = useState<number>(0);

  const selectedTicket = useMemo(() => {
    if (!event || !selectedTicketTypeId) return null;
    return event.ticketTypes.find((ticket) => ticket.id === selectedTicketTypeId) ?? null;
  }, [event, selectedTicketTypeId]);

  const totalMoney = useMemo(() => {
    if (!selectedTicket) return 0;
    const price = Number(selectedTicket.price);
    return (Number.isFinite(price) ? price : 0) * quantity;
  }, [selectedTicket, quantity]);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.push(`/login?next=${encodeURIComponent(`/events/${eventId}/buy`)}`);
      return;
    }
  }, [eventId, router]);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const response = await getEventById(eventId);
        if (isCancelled) return;
        setEvent(response);
        setSelectedTicketTypeId(response.ticketTypes[0]?.id ?? "");
      } catch (caughtError) {
        if (isCancelled) return;
        const message =
          caughtError instanceof Error ? caughtError.message : "Không tải được sự kiện.";
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

  useEffect(() => {
    if (!booking?.holdExpiresAt || step === 7) {
      setHoldMsLeft(0);
      return;
    }

    const expiresAt = new Date(booking.holdExpiresAt).getTime();

    function tick() {
      const ms = expiresAt - Date.now();
      setHoldMsLeft(ms);
    }

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [booking?.holdExpiresAt, step]);

  async function handleCreateHold() {
    if (!selectedTicketTypeId) {
      setError("Vui lòng chọn loại vé.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const created = await createBookingHold({
        eventId,
        ticketTypeId: selectedTicketTypeId,
        quantity,
      });
      setBooking(created);
      setStep(5);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Không giữ được vé.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmContact() {
    if (!booking) return;
    setIsSubmitting(true);
    setError("");

    try {
      const updated = await updateBookingContact(booking.id, {
        email: buyerEmail,
        phone: buyerPhone,
      });
      setBooking((prev) => (prev ? { ...prev, ...updated } : updated));
      setStep(6);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Không xác nhận được đơn.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePay() {
    if (!booking) return;
    setIsSubmitting(true);
    setError("");

    try {
      const updated = await payBooking(booking.id, { method: paymentMethod });
      setBooking((prev) => (prev ? { ...prev, ...updated } : updated));
      setStep(7);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Thanh toán thất bại.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setStep(4);
    setBooking(null);
    setBuyerEmail("");
    setBuyerPhone("");
    setPaymentMethod("MOMO");
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-600">
          Đang chuẩn bị trang đặt vé...
        </div>
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className="flex-1 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_45%),linear-gradient(180deg,#fcfcf8_0%,#f5f1e8_100%)]">
        <section className="mx-auto w-full max-w-4xl px-6 py-12 md:px-10 md:py-16">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
          <div className="mt-6">
            <Button asChild variant="outline" className="h-10 px-5">
              <Link href={`/events/${eventId}`}>Quay lại sự kiện</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  if (!event) {
    return null;
  }

  const holdIsExpired = booking?.holdExpiresAt ? Date.now() > new Date(booking.holdExpiresAt).getTime() : false;

  return (
    <main className="flex-1 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_45%),linear-gradient(180deg,#fcfcf8_0%,#f5f1e8_100%)]">
      <section className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <span className="inline-flex rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-sm text-stone-700">
              Đặt vé
            </span>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
              {event.title}
            </h1>
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
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="h-10 px-5">
              <Link href={`/events/${eventId}`}>Chi tiết sự kiện</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <Card className="border border-black/5 bg-white/85">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">
                {step === 4
                  ? "Bước 4: Chọn vé"
                  : step === 5
                    ? "Bước 5: Xác nhận đơn"
                    : step === 6
                      ? "Bước 6: Thanh toán"
                      : "Bước 7: Hoàn tất"}
              </CardTitle>
              {booking?.holdExpiresAt && step !== 7 ? (
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Clock className="size-4" />
                  Giữ vé còn:{" "}
                  <span className={holdMsLeft <= 30_000 ? "font-semibold text-red-600" : "font-semibold text-stone-900"}>
                    {formatCountdown(holdMsLeft)}
                  </span>
                </div>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4">
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Loại vé</Label>
                    <div className="grid gap-2">
                      {event.ticketTypes.map((ticketType) => (
                        <button
                          key={ticketType.id}
                          type="button"
                          className={`flex w-full items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition ${
                            selectedTicketTypeId === ticketType.id
                              ? "border-stone-900 bg-stone-900 text-white"
                              : "border-stone-200 bg-white hover:border-stone-300"
                          }`}
                          onClick={() => setSelectedTicketTypeId(ticketType.id)}
                        >
                          <div>
                            <p className="text-sm font-medium">{ticketType.name}</p>
                            <p className={`mt-1 text-xs ${selectedTicketTypeId === ticketType.id ? "text-white/80" : "text-stone-600"}`}>
                              Còn lại: {ticketType.available}
                            </p>
                          </div>
                          <p className="text-sm font-semibold">
                            {formatMoneyVnd(ticketType.price)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Số lượng</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 w-10 px-0"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          disabled={isSubmitting}
                        >
                          -
                        </Button>
                        <Input
                          id="quantity"
                          type="number"
                          min={1}
                          value={quantity}
                          onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 w-10 px-0"
                          onClick={() => setQuantity((q) => q + 1)}
                          disabled={isSubmitting}
                        >
                          +
                        </Button>
                      </div>
                      <p className="text-xs text-stone-600">
                        Có giới hạn số vé mỗi tài khoản (do backend kiểm tra).
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Chọn ghế</Label>
                      <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600">
                        (Tuỳ chọn) Chưa hỗ trợ chọn ghế trong phiên bản này.
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-stone-600">Tổng tiền</p>
                    <p className="text-lg font-semibold text-stone-950">
                      {formatMoneyVnd(totalMoney)}
                    </p>
                  </div>

                  <Button
                    type="button"
                    className="h-10 w-full bg-amber-500 text-stone-950 hover:bg-amber-400"
                    onClick={handleCreateHold}
                    disabled={isSubmitting}
                  >
                    <Ticket className="size-4" />
                    Tiếp tục
                  </Button>
                </div>
              ) : null}

              {step === 5 ? (
                <div className="space-y-4">
                  {holdIsExpired ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      Vé đã hết thời gian giữ. Vui lòng quay lại chọn vé.
                    </div>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="buyer-email">Email</Label>
                      <Input
                        id="buyer-email"
                        type="email"
                        placeholder="you@example.com"
                        value={buyerEmail}
                        onChange={(event) => setBuyerEmail(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buyer-phone">Số điện thoại</Label>
                      <Input
                        id="buyer-phone"
                        type="tel"
                        placeholder="090xxxxxxx"
                        value={buyerPhone}
                        onChange={(event) => setBuyerPhone(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="h-10 w-full bg-amber-500 text-stone-950 hover:bg-amber-400"
                    onClick={handleConfirmContact}
                    disabled={isSubmitting || holdIsExpired}
                  >
                    Xác nhận đơn
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full"
                    onClick={handleReset}
                    disabled={isSubmitting}
                  >
                    Quay lại chọn vé
                  </Button>
                </div>
              ) : null}

              {step === 6 ? (
                <div className="space-y-4">
                  {holdIsExpired ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      Vé đã hết thời gian giữ. Vui lòng quay lại chọn vé.
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <Label>Phương thức thanh toán</Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(Object.keys(paymentLabels) as PaymentMethod[]).map((method) => (
                        <button
                          key={method}
                          type="button"
                          className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                            paymentMethod === method
                              ? "border-stone-900 bg-stone-900 text-white"
                              : "border-stone-200 bg-white hover:border-stone-300"
                          }`}
                          onClick={() => setPaymentMethod(method)}
                        >
                          <span className="text-sm font-medium">{paymentLabels[method]}</span>
                          <CreditCard className="size-4" />
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-stone-600">
                      Hiện tại không tích hợp thanh toán thật. Bấm xác nhận sẽ xử lý như thanh toán thành công.
                    </p>
                  </div>

                  <Button
                    type="button"
                    className="h-10 w-full bg-amber-500 text-stone-950 hover:bg-amber-400"
                    onClick={handlePay}
                    disabled={isSubmitting || holdIsExpired}
                  >
                    Thanh toán
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full"
                    onClick={() => setStep(5)}
                    disabled={isSubmitting}
                  >
                    Quay lại
                  </Button>
                </div>
              ) : null}

              {step === 7 ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <BadgeCheck className="size-5" />
                      Đặt vé thành công
                    </div>
                    <p className="mt-2 text-sm text-emerald-800/90">
                      Mã đơn: <span className="font-semibold">{booking?.id}</span>
                    </p>
                    {booking?.qrCode ? (
                      <p className="mt-1 text-sm text-emerald-800/90">
                        QR code: <span className="font-semibold">{booking.qrCode}</span>
                      </p>
                    ) : null}
                  </div>

                  <Button asChild className="h-10 w-full">
                    <Link href="/events">Tiếp tục xem sự kiện</Link>
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border border-black/5 bg-white/85">
            <CardHeader>
              <CardTitle className="text-lg">Tóm tắt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <p className="text-stone-600">Sự kiện</p>
                <p className="font-medium text-stone-950">{event.title}</p>
                <div className="flex items-center gap-2 text-stone-600">
                  <CalendarDays className="size-4" />
                  {formatDateTimeVi(event.startDate)}
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <MapPin className="size-4" />
                  {event.location}
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <p className="text-stone-600">Vé</p>
                <div className="flex items-start justify-between gap-4">
                  <p className="font-medium text-stone-950">
                    {selectedTicket?.name ?? "Chưa chọn"}
                  </p>
                  <p className="text-stone-600">x{quantity}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-stone-600">Tổng tiền</p>
                  <p className="text-base font-semibold text-stone-950">
                    {formatMoneyVnd(step >= 5 && booking ? booking.totalPrice : totalMoney)}
                  </p>
                </div>
              </div>

              {step >= 5 && booking ? (
                <>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <p className="text-stone-600">Trạng thái</p>
                    <p className="font-medium text-stone-950">{booking.status}</p>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

