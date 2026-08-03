import {
  databases,
  ID,
  Query,
  DB_ID,
  BOOKINGS_COLLECTION,
} from "./appwrite";
import { Models } from "appwrite";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Booking {
  $id: string;
  $createdAt: string;
  spaceId: string;
  spaceName: string;
  spaceType: string;
  spaceLocation: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  hostId: string;
}

export type BookingDoc = Models.Document & Booking;

// ─── Create Booking ───────────────────────────────────────────────────────────
export async function createBooking(
  data: Omit<Booking, "$id" | "$createdAt">
): Promise<BookingDoc> {
  const doc = await databases.createDocument(
    DB_ID,
    BOOKINGS_COLLECTION,
    ID.unique(),
    { ...data, status: "confirmed" }
  );
  return doc as BookingDoc;
}

// ─── My Bookings (as guest) ────────────────────────────────────────────────────
export async function getMyBookings(userId: string): Promise<BookingDoc[]> {
  const res = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
    Query.equal("userId", userId),
    Query.orderDesc("$createdAt"),
  ]);
  return res.documents as BookingDoc[];
}

// ─── Bookings for host's spaces ────────────────────────────────────────────────
export async function getHostBookings(hostId: string): Promise<BookingDoc[]> {
  const res = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
    Query.equal("hostId", hostId),
    Query.orderDesc("$createdAt"),
  ]);
  return res.documents as BookingDoc[];
}

// ─── Cancel Booking ────────────────────────────────────────────────────────────
export async function cancelBooking(id: string): Promise<void> {
  await databases.updateDocument(DB_ID, BOOKINGS_COLLECTION, id, {
    status: "cancelled",
  });
}

// ─── Check Availability ────────────────────────────────────────────────────────
export async function checkAvailability(
  spaceId: string,
  date: string,
  start: string,
  end: string
): Promise<boolean> {
  const res = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
    Query.equal("spaceId", spaceId),
    Query.equal("date", date),
    Query.notEqual("status", "cancelled"),
  ]);
  // Simple overlap check
  return !res.documents.some((b) => {
    return !(end <= b.startTime || start >= b.endTime);
  });
}
