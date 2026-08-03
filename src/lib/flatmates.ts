import { databases, ID, Query, DB_ID } from "./appwrite";
import { Models } from "appwrite";

export const FLATMATES_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_FLATMATES_COLLECTION ?? "flatmates";

export interface Flatmate {
  $id: string;
  $createdAt: string;
  userId: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Any";
  occupation: string;
  bio: string;
  budgetMin: number;
  budgetMax: number;
  locations: string;   // JSON array string
  urgency: "ASAP" | "This month" | "Next month" | "Flexible";
  avatarColor: string;
  avatarId: string | null;
}

export type FlatmateDoc = Models.Document & Flatmate;

function parse(doc: Models.Document): FlatmateDoc {
  return { ...doc, locations: doc.locations ?? "[]" , avatarId: doc.avatarId ?? null } as FlatmateDoc;
}

export function getLocations(f: FlatmateDoc): string[] {
  try { return JSON.parse(f.locations); } catch { return []; }
}

export async function createFlatmate(
  data: Omit<Flatmate, "$id" | "$createdAt">
): Promise<FlatmateDoc> {
  const doc = await databases.createDocument(DB_ID, FLATMATES_COLLECTION, ID.unique(), data);
  return parse(doc);
}

export async function listFlatmates(): Promise<FlatmateDoc[]> {
  const res = await databases.listDocuments(DB_ID, FLATMATES_COLLECTION, [
    Query.orderDesc("$createdAt"), Query.limit(50),
  ]);
  return res.documents.map(parse);
}

export async function getMyFlatmateProfile(userId: string): Promise<FlatmateDoc | null> {
  const res = await databases.listDocuments(DB_ID, FLATMATES_COLLECTION, [
    Query.equal("userId", userId), Query.limit(1),
  ]);
  return res.documents.length ? parse(res.documents[0]) : null;
}

export async function deleteFlatmate(id: string): Promise<void> {
  await databases.deleteDocument(DB_ID, FLATMATES_COLLECTION, id);
}

export const AVATAR_COLORS = [
  "#f9a8d4", "#86efac", "#93c5fd", "#fcd34d", "#c4b5fd",
  "#6ee7b7", "#fca5a5", "#a5f3fc", "#fdba74", "#d9f99d",
];
export const randomAvatarColor = () =>
  AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
