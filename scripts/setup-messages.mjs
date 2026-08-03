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
  console.log("\n💬  Setting up Messages collections\n");

  // ── Conversations ──
  await safe(() => db.createCollection(databaseId, "conversations", "Conversations", [
    Permission.read(Role.users()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
  ]), "Collection: conversations");

  const convAttrs = [
    ["participantIds",   () => db.createStringAttribute(databaseId, "conversations", "participantIds", 500, true)],
    ["participantNames", () => db.createStringAttribute(databaseId, "conversations", "participantNames", 500, true)],
    ["lastMessage",      () => db.createStringAttribute(databaseId, "conversations", "lastMessage", 200, false)],
    ["lastMessageAt",    () => db.createStringAttribute(databaseId, "conversations", "lastMessageAt", 50, false)],
    ["unreadCount",      () => db.createIntegerAttribute(databaseId, "conversations", "unreadCount", false, 0)],
    ["contextType",      () => db.createStringAttribute(databaseId, "conversations", "contextType", 50, false)],
    ["contextId",        () => db.createStringAttribute(databaseId, "conversations", "contextId", 255, false)],
    ["contextTitle",     () => db.createStringAttribute(databaseId, "conversations", "contextTitle", 255, false)],
  ];
  for (const [name, fn] of convAttrs) await safe(fn, `conversations.${name}`);
  await wait(4000);
  await safe(() => db.createIndex(databaseId, "conversations", "idx_participants", "fulltext", ["participantIds"]), "idx_participants");

  // ── Messages ──
  await safe(() => db.createCollection(databaseId, "messages", "Messages", [
    Permission.read(Role.users()),
    Permission.create(Role.users()),
    Permission.update(Role.users()),
    Permission.delete(Role.users()),
  ]), "Collection: messages");

  const msgAttrs = [
    ["conversationId", () => db.createStringAttribute(databaseId, "messages", "conversationId", 255, true)],
    ["senderId",       () => db.createStringAttribute(databaseId, "messages", "senderId", 255, true)],
    ["senderName",     () => db.createStringAttribute(databaseId, "messages", "senderName", 255, true)],
    ["receiverId",     () => db.createStringAttribute(databaseId, "messages", "receiverId", 255, true)],
    ["text",           () => db.createStringAttribute(databaseId, "messages", "text", 2000, true)],
    ["read",           () => db.createBooleanAttribute(databaseId, "messages", "read", false)],
  ];
  for (const [name, fn] of msgAttrs) await safe(fn, `messages.${name}`);
  await wait(4000);
  await safe(() => db.createIndex(databaseId, "messages", "idx_conversationId", "key", ["conversationId"]), "idx_conversationId");

  console.log("\n✅  Messages setup complete!\n");
  console.log("Add to .env.local:");
  console.log("  NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION=messages");
  console.log("  NEXT_PUBLIC_APPWRITE_CONVERSATIONS_COLLECTION=conversations\n");
}

main().catch(e => { console.error("❌", e.message); process.exit(1); });
