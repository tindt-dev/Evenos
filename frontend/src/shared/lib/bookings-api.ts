import { apiFetch } from "@/shared/lib/api";
import type { EventItem, EventTicketType } from "@/shared/lib/events-api";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "REFUNDED"
  | "EXPIRED"
  | "CHECKED_IN";

export type Booking = {
  id: string;
  userId: string;
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  qrCode: string | null;
  status: BookingStatus;
  totalPrice: string;
  buyerEmail?: string | null;
  buyerPhone?: string | null;
  paymentMethod?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  holdExpiresAt?: string; // injected by backend response
  event?: EventItem;
  ticketType?: EventTicketType;
};

export async function createBookingHold(payload: {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
}) {
  return apiFetch<Booking>("/bookings", {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateBookingContact(
  bookingId: string,
  payload: { email: string; phone: string },
) {
  return apiFetch<Booking>(`/bookings/${bookingId}/contact`, {
    method: "PATCH",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function payBooking(bookingId: string, payload: { method: string }) {
  return apiFetch<Booking>(`/bookings/${bookingId}/pay`, {
    method: "POST",
    auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getMyBookings() {
  return apiFetch<Booking[]>("/bookings", { auth: true });
}

