import { apiFetch } from "@/shared/lib/api";

export type EventTicketType = {
  id: string;
  name: string;
  price: string; // Prisma Decimal serializes to string
  available: number;
  capacity?: number;
};

export type EventCreator = {
  id: string;
  fullName: string | null;
  email: string;
};

export type EventItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl: string | null;
  category: string;
  creator: EventCreator;
  ticketTypes: EventTicketType[];
};

export async function getEvents() {
  return apiFetch<EventItem[]>("/events");
}

export async function getEventById(id: string) {
  return apiFetch<EventItem>(`/events/${id}`);
}

