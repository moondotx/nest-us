import { Client, Databases, ID, Permission, Role } from "node-appwrite";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), "../.env.local") });

const { NEXT_PUBLIC_APPWRITE_ENDPOINT: endpoint, NEXT_PUBLIC_APPWRITE_PROJECT_ID: projectId,
  NEXT_PUBLIC_APPWRITE_DATABASE_ID: databaseId, APPWRITE_API_KEY: apiKey } = process.env;

if (!endpoint || !projectId || !apiKey) { console.error("❌ Missing env vars"); process.exit(1); }

const db = new Databases(new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey));
const wait = ms => new Promise(r => setTimeout(r, ms));
const safe = async (fn, label) => {
  try { await fn(); console.log(`  ✅  ${label}`); await wait(300); }
  catch (e) { e.code === 409 ? console.log(`  ⚠️   ${label} (exists)`) : console.error(`  ❌  ${label}: ${e.message}`); }
};

async function main() {
  console.log("\n👥  Setting up Flatmates collection\n");
  const COLL = "flatmates";

  await safe(() => db.createCollection(databaseId, COLL, "Flatmates", [
    Permission.read(Role.any()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
  ]), "Collection: flatmates");

  const attrs = [
    ["userId",      () => db.createStringAttribute(databaseId, COLL, "userId", 255, true)],
    ["name",        () => db.createStringAttribute(databaseId, COLL, "name", 255, true)],
    ["age",         () => db.createIntegerAttribute(databaseId, COLL, "age", true, 18, 99)],
    ["gender",      () => db.createEnumAttribute(databaseId, COLL, "gender", ["Male","Female","Any"], true)],
    ["occupation",  () => db.createStringAttribute(databaseId, COLL, "occupation", 255, false)],
    ["bio",         () => db.createStringAttribute(databaseId, COLL, "bio", 1000, false)],
    ["budgetMin",   () => db.createFloatAttribute(databaseId, COLL, "budgetMin", true, 0)],
    ["budgetMax",   () => db.createFloatAttribute(databaseId, COLL, "budgetMax", true, 0)],
    ["locations",   () => db.createStringAttribute(databaseId, COLL, "locations", 1000, false)],
    ["urgency",     () => db.createEnumAttribute(databaseId, COLL, "urgency", ["ASAP","This month","Next month","Flexible"], true)],
    ["avatarColor", () => db.createStringAttribute(databaseId, COLL, "avatarColor", 20, false)],
    ["avatarId",    () => db.createStringAttribute(databaseId, COLL, "avatarId", 255, false)],
  ];

  console.log("  Creating attributes...");
  for (const [name, fn] of attrs) await safe(fn, `flatmates.${name}`);

  await wait(4000);
  console.log("  Creating indexes...");
  await safe(() => db.createIndex(databaseId, COLL, "idx_userId", "key", ["userId"]), "idx_userId");
  await safe(() => db.createIndex(databaseId, COLL, "idx_gender", "key", ["gender"]), "idx_gender");
  await safe(() => db.createIndex(databaseId, COLL, "idx_urgency", "key", ["urgency"]), "idx_urgency");

  console.log("\n✅  Flatmates collection ready!\n");
  console.log("Add this to your .env.local:");
  console.log("  NEXT_PUBLIC_APPWRITE_FLATMATES_COLLECTION=flatmates\n");
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
