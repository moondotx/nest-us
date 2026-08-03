"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getMyConversations, ConversationDoc, getOtherParticipant } from "@/lib/messages";
import { MessageCircle, Search } from "lucide-react";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationDoc[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    getMyConversations(user.$id)
      .then(setConversations)
      .finally(() => setFetching(false));
  }, [user, loading]);

  const filtered = conversations.filter(c => {
    const other = getOtherParticipant(c, user?.$id ?? "");
    return other.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contextTitle?.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(search.toLowerCase());
  });

  if (loading || fetching) return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 12, padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--surface)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 14, background: "var(--surface)", borderRadius: 6, width: "40%", marginBottom: 8 }} />
            <div style={{ height: 12, background: "var(--surface)", borderRadius: 6, width: "70%" }} />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px 64px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--dark)" }}>Messages</h1>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>{conversations.length} conversations</span>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..."
          style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, outline: "none", background: "white", boxSizing: "border-box" }} />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <MessageCircle size={48} color="var(--border)" style={{ margin: "0 auto 16px", display: "block" }} />
          <p style={{ fontWeight: 700, fontSize: 17, color: "var(--dark)", marginBottom: 6 }}>No messages yet</p>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Start a conversation by messaging a host or flatmate</p>
        </div>
      ) : (
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
          {filtered.map((c, i) => {
            const other = getOtherParticipant(c, user!.$id);
            const initial = other.name.charAt(0).toUpperCase();
            const hasUnread = c.unreadCount > 0;
            return (
              <Link key={c.$id} href={`/messages/${c.$id}`} style={{ textDecoration: "none", display: "block" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                  borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                  background: "white", transition: "background 0.15s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "white")}
                >
                  {/* Avatar */}
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--green)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, flexShrink: 0, position: "relative" }}>
                    {initial}
                    {hasUnread && (
                      <div style={{ position: "absolute", top: 0, right: 0, width: 14, height: 14, borderRadius: "50%", background: "#ef4444", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "white", fontWeight: 800 }}>
                        {c.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <span style={{ fontWeight: hasUnread ? 700 : 600, fontSize: 15, color: "var(--dark)" }}>{other.name}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>{timeAgo(c.lastMessageAt)}</span>
                    </div>
                    {c.contextTitle && (
                      <p style={{ fontSize: 11, color: "var(--green)", fontWeight: 600, marginBottom: 2 }}>re: {c.contextTitle}</p>
                    )}
                    <p style={{ fontSize: 13, color: hasUnread ? "var(--text)" : "var(--muted)", fontWeight: hasUnread ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.lastMessage || "Start a conversation"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
