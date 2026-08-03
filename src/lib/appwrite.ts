import { Client, Account, Databases, Storage, ID, Query } from "appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query };
export default client;

// ─── Appwrite Resource IDs ────────────────────────────────────────────────────
// Fill these in after creating collections in Appwrite Console
export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
export const SPACES_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_SPACES_COLLECTION!;
export const BOOKINGS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_BOOKINGS_COLLECTION!;
export const IMAGES_BUCKET = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;
