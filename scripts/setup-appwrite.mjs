/**
 * NEST BOOKING — Appwrite Database Setup Script
 * ─────────────────────────────────────────────
 * Run this ONCE to create all collections, attributes, and indexes.
 *
 * Usage:
 *   1. npm install node-appwrite dotenv
 *   2. Create a .env.local with your values (see .env.local.example)
 *   3. Generate a Server API Key in Appwrite Console → Project Settings → API Keys
 *      (grant: databases.write, databases.read)
 *   4. Add APPWRITE_API_KEY=your_server_key to .env.local
 *   5. node scripts/setup-appwrite.mjs
 */

import { Client, Databases, Storage, ID, Permission, Role } from "node-appwrite";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, "../.env.local");

// Parse .env.local manually (dotenv.config path)
dotenv.config({ path: envPath });

const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT: endpoint,
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: projectId,
  NEXT_PUBLIC_APPWRITE_DATABASE_ID: databaseId,
  NEXT_PUBLIC_APPWRITE_SPACES_COLLECTION: spacesCollId,
  NEXT_PUBLIC_APPWRITE_BOOKINGS_COLLECTION: bookingsCollId,
  NEXT_PUBLIC_APPWRITE_BUCKET_ID: bucketId,
  APPWRITE_API_KEY: apiKey,
} = process.env;

if (!endpoint || !projectId || !apiKey) {
  console.error("❌  Missing required env vars. Check .env.local");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const db = new Databases(client);
const storage = new Storage(client);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function safeCreate(fn, label) {
  try {
    const res = await fn();
    console.log(`  ✅  ${label}`);
    await wait(300); // Rate limit buffer
    return res;
  } catch (e) {
    if (e.code === 409) {
      console.log(`  ⚠️   ${label} (already exists, skipping)`);
    } else {
      console.error(`  ❌  ${label}: ${e.message}`);
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🏗️   Nest Booking — Appwrite Setup\n");

  // 1. Database
  console.log("📦  Creating database...");
  await safeCreate(
    () => db.create(databaseId, "NestBooking"),
    `Database: ${databaseId}`
  );

  // 2. Spaces collection
  console.log("\n📋  Creating Spaces collection...");
  await safeCreate(
    () =>
      db.createCollection(databaseId, spacesCollId, "Spaces", [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]),
    "Collection: spaces"
  );

  const spaceAttrs = [
    () => db.createStringAttribute(databaseId, spacesCollId, "title", 255, true),
    () => db.createEnumAttribute(databaseId, spacesCollId, "type", ["office", "apartment", "hostel", "hotel"], true),
    () => db.createStringAttribute(databaseId, spacesCollId, "description", 2000, false),
    () => db.createFloatAttribute(databaseId, spacesCollId, "price", true, 0),
    () => db.createStringAttribute(databaseId, spacesCollId, "location", 500, true),
    () => db.createIntegerAttribute(databaseId, spacesCollId, "capacity", true, 1),
    () => db.createStringAttribute(databaseId, spacesCollId, "amenities", 2000, false), // JSON string
    () => db.createStringAttribute(databaseId, spacesCollId, "availability", 255, false),
    () => db.createStringAttribute(databaseId, spacesCollId, "imageId", 255, false),
    () => db.createStringAttribute(databaseId, spacesCollId, "hostId", 255, true),
    () => db.createStringAttribute(databaseId, spacesCollId, "hostName", 255, true),
    () => db.createFloatAttribute(databaseId, spacesCollId, "rating", false, 0),
    () => db.createIntegerAttribute(databaseId, spacesCollId, "reviewCount", false, 0),
    () => db.createIntegerAttribute(databaseId, spacesCollId, "views", false, 0),
  ];

  const spaceAttrNames = [
    "title", "type", "description", "price", "location",
    "capacity", "amenities", "availability", "imageId",
    "hostId", "hostName", "rating", "reviewCount",
    "views",
  ];

  console.log("  Creating attributes...");
  for (let i = 0; i < spaceAttrs.length; i++) {
    await safeCreate(spaceAttrs[i], `  Attr: spaces.${spaceAttrNames[i]}`);
  }

  // Wait for attributes to be ready before creating indexes
  console.log("  Waiting for attributes to activate...");
  await wait(4000);

  console.log("  Creating indexes...");
  await safeCreate(
    () => db.createIndex(databaseId, spacesCollId, "idx_type", "key", ["type"]),
    "Index: spaces.type"
  );
  await safeCreate(
    () => db.createIndex(databaseId, spacesCollId, "idx_hostId", "key", ["hostId"]),
    "Index: spaces.hostId"
  );

  // 3. Bookings collection
  console.log("\n📋  Creating Bookings collection...");
  await safeCreate(
    () =>
      db.createCollection(databaseId, bookingsCollId, "Bookings", [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]),
    "Collection: bookings"
  );

  const bookingAttrs = [
    () => db.createStringAttribute(databaseId, bookingsCollId, "spaceId", 255, true),
    () => db.createStringAttribute(databaseId, bookingsCollId, "spaceName", 255, true),
    () => db.createStringAttribute(databaseId, bookingsCollId, "spaceType", 50, true),
    () => db.createStringAttribute(databaseId, bookingsCollId, "spaceLocation", 500, true),
    () => db.createStringAttribute(databaseId, bookingsCollId, "userId", 255, true),
    () => db.createStringAttribute(databaseId, bookingsCollId, "userName", 255, true),
    () => db.createStringAttribute(databaseId, bookingsCollId, "userEmail", 255, true),
    () => db.createStringAttribute(databaseId, bookingsCollId, "date", 20, true),
    () => db.createStringAttribute(databaseId, bookingsCollId, "startTime", 10, true),
    () => db.createStringAttribute(databaseId, bookingsCollId, "endTime", 10, true),
    () => db.createFloatAttribute(databaseId, bookingsCollId, "hours", true, 0),
    () => db.createFloatAttribute(databaseId, bookingsCollId, "totalPrice", true, 0),
    () => db.createEnumAttribute(databaseId, bookingsCollId, "status", ["pending", "confirmed", "cancelled"], true),
    () => db.createStringAttribute(databaseId, bookingsCollId, "hostId", 255, true),
  ];

  const bookingAttrNames = [
    "spaceId", "spaceName", "spaceType", "spaceLocation",
    "userId", "userName", "userEmail", "date", "startTime",
    "endTime", "hours", "totalPrice", "status", "hostId",
  ];

  console.log("  Creating attributes...");
  for (let i = 0; i < bookingAttrs.length; i++) {
    await safeCreate(bookingAttrs[i], `  Attr: bookings.${bookingAttrNames[i]}`);
  }

  await wait(4000);

  console.log("  Creating indexes...");
  await safeCreate(
    () => db.createIndex(databaseId, bookingsCollId, "idx_userId", "key", ["userId"]),
    "Index: bookings.userId"
  );
  await safeCreate(
    () => db.createIndex(databaseId, bookingsCollId, "idx_hostId", "key", ["hostId"]),
    "Index: bookings.hostId"
  );
  await safeCreate(
    () => db.createIndex(databaseId, bookingsCollId, "idx_spaceId", "key", ["spaceId"]),
    "Index: bookings.spaceId"
  );

  // 4. Storage bucket
  console.log("\n🗄️   Creating Storage bucket...");
  await safeCreate(
    () =>
      storage.createBucket(bucketId, "Space Images", [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.delete(Role.users()),
      ], false, false, 10485760, ["jpg", "jpeg", "png", "webp", "avif"]),
    `Bucket: ${bucketId}`
  );

  console.log("\n✅  Setup complete!\n");
  console.log("Next steps:");
  console.log("  1. Copy .env.local.example → .env.local and fill in your values");
  console.log("  2. npm install");
  console.log("  3. npm run dev\n");
}

main().catch((e) => {
  console.error("\n❌  Setup failed:", e.message);
  process.exit(1);
});
