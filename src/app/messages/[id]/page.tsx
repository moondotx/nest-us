"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  getMessages, sendMessage, markAsRead, subscribeToMessages,
  MessageDoc, ConversationDoc, getOtherParticipant,
} from "@/lib/messages";
import { databases, DB_ID } from "@/lib/appwrite";
import { CONVERSATIONS_COLLECTION } from "@/lib/messages";
import { ArrowLeft, Send, Home } from "lucide-react";

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [conversation, setConversation] = useState<ConversationDoc | null>(null);
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [fetching, setFetching] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load conversation + messages
  useEffect(() => {
    if (loading || !user || !id) return;
    Promise.all([
      databases.getDocument(DB_ID, CONVERSATIONS_COLLECTION, id as string),
      getMessages(id as string),
    ]).then(([conv, msgs]) => {
      setConversation(conv as ConversationDoc);
      setMessages(msgs);
      markAsRead(id as string);
    }).catch(() => router.push("/messages"))
      .finally(() => setFetching(false));
  }, [user, loading, id]);

  // Real-time subscription — only add messages from the OTHER person
  // Our own messages are already added via optimistic update
  useEffect(() => {
    if (!id || !user) return;
    const unsub = subscribeToMessages(id as string, (msg) => {
      if (msg.senderId === user.$id) return; // skip own — already optimistically added
      setMessages(prev => {
        if (prev.find(m => m.$id === msg.$id)) return prev;
        return [...prev, msg];
      });
    });
    return () => unsub();
  }, [id, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !user || !conversation || sending) return;
    const other = getOtherParticipant(conversation, user.$id);
    const msgText = text.trim();
    setText("");
    setSending(true);

    // Optimistic update
    const optimistic: MessageDoc = {
      $id: `temp-${Date.now()}`,
      $createdAt: new Date().toISOString(),
      conversationId: id as string,
      senderId: user.$id,
      senderName: user.name,
      receiverId: other.id,
      text: msgText,
      read: false,
    } as MessageDoc;
    setMessages(prev => [...prev, optimistic]);

    try {
      const real = await sendMessage(id as string, user.$id, user.name, other.id, msgText);
      setMessages(prev => prev.map(m => m.$id === optimistic.$id ? real : m));
    } catch {
      setMessages(prev => prev.filter(m => m.$id !== optimistic.$id));
      setText(msgText);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (loading || fetching) return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "white" }}>
        <div style={{ height: 20, background: "var(--surface)", borderRadius: 6, width: 160 }} />
      </div>
      <div style={{ flex: 1, padding: 20 }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ display: "flex", justifyContent: i % 2 === 0 ? "flex-start" : "flex-end", marginBottom: 12 }}>
            <div style={{ height: 36, background: "var(--surface)", borderRadius: 12, width: `${120 + i * 30}px` }} />
          </div>
        ))}
      </div>
    </div>
  );

  if (!user) { router.push("/login"); return null; }
  if (!conversation) return null;

  const other = getOtherParticipant(conversation, user.$id);
  const otherInitial = other.name.charAt(0).toUpperCase();

  // Group messages by day
  const grouped: { day: string; messages: MessageDoc[] }[] = [];
  messages.forEach(msg => {
    const day = formatDay(msg.$createdAt);
    const last = grouped[grouped.length - 1];
    if (last?.day === day) { last.messages.push(msg); }
    else { grouped.push({ day, messages: [msg] }); }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", background: "white" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "white", flexShrink: 0 }}>
        <Link href="/messages" style={{ color: "var(--muted)", display: "flex" }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--green)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
          {otherInitial}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: "var(--dark)", lineHeight: 1.2 }}>{other.name}</p>
          {conversation.contextTitle && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--muted)" }}>
              <Home size={11} />
              <span>{conversation.contextTitle}</span>
            </div>
          )}
        </div>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted)", fontSize: 14 }}>
            <p>Say hello to {other.name}!</p>
          </div>
        )}

        {grouped.map(({ day, messages: dayMsgs }) => (
          <div key={day}>
            {/* Day separator */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 12px" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", whiteSpace: "nowrap" }}>{day}</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            {dayMsgs.map((msg, i) => {
              const isMe = msg.senderId === user.$id;
              const isTemp = msg.$id.startsWith("temp-");
              const showAvatar = !isMe && (i === 0 || dayMsgs[i - 1]?.senderId !== msg.senderId);
              const showTime = i === dayMsgs.length - 1 || dayMsgs[i + 1]?.senderId !== msg.senderId;

              return (
                <div key={msg.$id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", marginBottom: 3 }}>
                  {showAvatar && !isMe && (
                    <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 4, marginBottom: 3 }}>{msg.senderName}</span>
                  )}
                  <div style={{
                    maxWidth: "72%", padding: "10px 14px", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: isMe ? "var(--green)" : "var(--surface)",
                    color: isMe ? "white" : "var(--dark)",
                    fontSize: 14, lineHeight: 1.5,
                    opacity: isTemp ? 0.7 : 1,
                    wordBreak: "break-word",
                  }}>
                    {msg.text}
                  </div>
                  {showTime && (
                    <span style={{ fontSize: 10, color: "var(--muted)", margin: "3px 4px 8px" }}>
                      {formatTime(msg.$createdAt)}{isTemp ? " · Sending..." : ""}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", background: "white", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "var(--surface)", borderRadius: 24, padding: "8px 8px 8px 16px", border: "1.5px solid var(--border)" }}>
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            style={{
              flex: 1, border: "none", background: "transparent", outline: "none", resize: "none",
              fontSize: 14, color: "var(--text)", fontFamily: "inherit", lineHeight: 1.5,
              maxHeight: 120, overflowY: "auto",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            style={{
              width: 38, height: 38, borderRadius: "50%", border: "none", flexShrink: 0,
              background: text.trim() ? "var(--green)" : "var(--border)",
              color: "white", cursor: text.trim() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.15s",
            }}>
            <Send size={16} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 6 }}>Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
