import {
  databases, storage, ID, Query,
  DB_ID, SPACES_COLLECTION, IMAGES_BUCKET,
} from "./appwrite";
import { Models } from "appwrite";

export interface Space {
  $id: string;
  $createdAt: string;
  title: string;
  type: "office" | "apartment" | "hostel" | "hotel";
  description: string;
  price: number;
  location: string;
  capacity: number;
  amenities: string[];      // stored as JSON string
  availability: string;
  imageId: string | null;   // kept for backward compat (first image)
  mediaIds: string[];       // all file IDs (images + videos) as JSON string
  hostId: string;
  hostName: string;
  rating: number;
  reviewCount: number;
  views: number;
}

export type SpaceDoc = Models.Document & Space;

function parse(doc: Models.Document): SpaceDoc {
  return {
    ...doc,
    amenities: typeof doc.amenities === "string" ? JSON.parse(doc.amenities) : doc.amenities ?? [],
    mediaIds: typeof doc.mediaIds === "string" ? JSON.parse(doc.mediaIds) : doc.mediaIds ?? [],
  } as SpaceDoc;
}

// ─── Upload a single file (image or video) ────────────────────────────────────
export async function uploadFile(file: File): Promise<string> {
  const res = await storage.createFile(IMAGES_BUCKET, ID.unique(), file);
  return res.$id;
}

// ─── Upload multiple files ────────────────────────────────────────────────────
export async function uploadFiles(files: File[]): Promise<string[]> {
  const ids: string[] = [];
  for (const file of files) {
    const id = await uploadFile(file);
    ids.push(id);
  }
  return ids;
}

// ─── Get URL for any file ─────────────────────────────────────────────────────
export function getFileUrl(fileId: string): string {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${IMAGES_BUCKET}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
}

// Alias for backward compat
export const getImageUrl = getFileUrl;

// ─── Is it a video file ID? (check by trying — Appwrite doesn't store mime) ──
export function isVideoFile(filename: string): boolean {
  return /\.(mp4|mov|webm|avi|mkv)$/i.test(filename);
}

// ─── Create Space ─────────────────────────────────────────────────────────────
export async function createSpace(
  data: Omit<Space, "$id" | "$createdAt" | "rating" | "reviewCount">
): Promise<SpaceDoc> {
  const doc = await databases.createDocument(DB_ID, SPACES_COLLECTION, ID.unique(), {
    ...data,
    amenities: JSON.stringify(data.amenities),
    mediaIds: JSON.stringify(data.mediaIds ?? []),
    rating: 0,
    reviewCount: 0,
    views: 0,
  });
  return parse(doc);
}

// ─── List Spaces ──────────────────────────────────────────────────────────────
export async function listSpaces(type?: string): Promise<SpaceDoc[]> {
  const queries = [Query.orderDesc("$createdAt"), Query.limit(50)];
  if (type && type !== "all") queries.push(Query.equal("type", type));
  const res = await databases.listDocuments(DB_ID, SPACES_COLLECTION, queries);
  return res.documents.map(parse);
}

// ─── Get Single Space ─────────────────────────────────────────────────────────
export async function getSpace(id: string): Promise<SpaceDoc> {
  const doc = await databases.getDocument(DB_ID, SPACES_COLLECTION, id);
  return parse(doc);
}

// ─── My Listings ─────────────────────────────────────────────────────────────
export async function getMySpaces(hostId: string): Promise<SpaceDoc[]> {
  const res = await databases.listDocuments(DB_ID, SPACES_COLLECTION, [
    Query.equal("hostId", hostId),
    Query.orderDesc("$createdAt"),
  ]);
  return res.documents.map(parse);
}

// ─── Increment Views ──────────────────────────────────────────────────────────
export async function incrementViews(id: string, currentViews: number): Promise<void> {
  try {
    await databases.updateDocument(DB_ID, SPACES_COLLECTION, id, {
      views: currentViews + 1,
    });
  } catch {
    // silently fail — views are non-critical
  }
}

// ─── Delete Space ─────────────────────────────────────────────────────────────
export async function deleteSpace(id: string): Promise<void> {
  await databases.deleteDocument(DB_ID, SPACES_COLLECTION, id);
}
