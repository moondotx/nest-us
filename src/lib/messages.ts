import { databases, ID, Query, DB_ID } from "./appwrite";
import client from "./appwrite";
import { Models } from "appwrite";

export const MESSAGES_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION ?? "messages";
export const CONVERSATIONS_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_CONVERSATIONS_COLLECTION ?? "conversations";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Message {
  $id: string;
  $createdAt: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  read: boolean;
}

export interface Conversation {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  participantIds: string;   // JSON array of 2 user IDs
  participantNames: string; // JSON array of 2 user names
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  contextType: string;      // "space" | "flatmate" | "general"
  contextId: string;        // space or flatmate ID
  contextTitle: string;     // space title or flatmate name
}

export type MessageDoc = Models.Document & Message;
export type ConversationDoc = Models.Document & Conversation;

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getParticipants(c: ConversationDoc): string[] {
  try { return JSON.parse(c.participantIds); } catch { return []; }
}
export function getParticipantNames(c: ConversationDoc): string[] {
  try { return JSON.parse(c.participantNames); } catch { return []; }
}
export function getOtherParticipant(c: ConversationDoc, myId: string): { id: string; name: string } {
  const ids = getParticipants(c);
  const names = getParticipantNames(c);
  const idx = ids[0] === myId ? 1 : 0;
  return { id: ids[idx] ?? "", name: names[idx] ?? "User" };
}

// ─── Find or create conversation ─────────────────────────────────────────────
export async function findOrCreateConversation(
  myId: string, myName: string,
  otherId: string, otherName: string,
  contextType: string, contextId: string, contextTitle: string
): Promise<ConversationDoc> {
  // Search for existing conversation between these two users
  const res = await databases.listDocuments(DB_ID, CONVERSATIONS_COLLECTION, [
    Query.search("participantIds", myId),
    Query.limit(50),
  ]);

  const existing = res.documents.find(doc => {
    const ids = JSON.parse(doc.participantIds ?? "[]");
    return ids.includes(myId) && ids.includes(otherId);
  });

  if (existing) return existing as ConversationDoc;

  // Create new conversation
  const doc = await databases.createDocument(DB_ID, CONVERSATIONS_COLLECTION, ID.unique(), {
    participantIds: JSON.stringify([myId, otherId]),
    participantNames: JSON.stringify([myName, otherName]),
    lastMessage: "",
    lastMessageAt: new Date().toISOString(),
    unreadCount: 0,
    contextType,
    contextId,
    contextTitle,
  });
  return doc as ConversationDoc;
}

// ─── Get my conversations ─────────────────────────────────────────────────────
export async function getMyConversations(userId: string): Promise<ConversationDoc[]> {
  const res = await databases.listDocuments(DB_ID, CONVERSATIONS_COLLECTION, [
    Query.search("participantIds", userId),
    Query.orderDesc("lastMessageAt"),
    Query.limit(50),
  ]);
  return res.documents as ConversationDoc[];
}

// ─── Get messages in a conversation ──────────────────────────────────────────
export async function getMessages(conversationId: string): Promise<MessageDoc[]> {
  const res = await databases.listDocuments(DB_ID, MESSAGES_COLLECTION, [
    Query.equal("conversationId", conversationId),
    Query.orderAsc("$createdAt"),
    Query.limit(100),
  ]);
  return res.documents as MessageDoc[];
}

// ─── Send a message ───────────────────────────────────────────────────────────
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  receiverId: string,
  text: string
): Promise<MessageDoc> {
  const msg = await databases.createDocument(DB_ID, MESSAGES_COLLECTION, ID.unique(), {
    conversationId, senderId, senderName, receiverId, text, read: false,
  });

  // Update conversation last message
  await databases.updateDocument(DB_ID, CONVERSATIONS_COLLECTION, conversationId, {
    lastMessage: text.slice(0, 100),
    lastMessageAt: new Date().toISOString(),
    unreadCount: 1,
  });

  return msg as MessageDoc;
}

// ─── Mark messages as read ────────────────────────────────────────────────────
export async function markAsRead(conversationId: string): Promise<void> {
  try {
    await databases.updateDocument(DB_ID, CONVERSATIONS_COLLECTION, conversationId, {
      unreadCount: 0,
    });
  } catch {}
}

// ─── Subscribe to real-time messages ─────────────────────────────────────────
export function subscribeToMessages(
  conversationId: string,
  onMessage: (msg: MessageDoc) => void
): () => void {
  const unsubscribe = client.subscribe(
    `databases.${DB_ID}.collections.${MESSAGES_COLLECTION}.documents`,
    (response) => {
      if (
        response.events.includes(`databases.${DB_ID}.collections.${MESSAGES_COLLECTION}.documents.*.create`)
      ) {
        const doc = response.payload as MessageDoc;
        if (doc.conversationId === conversationId) {
          onMessage(doc);
        }
      }
    }
  );
  return unsubscribe;
}
