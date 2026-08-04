"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { FLATMATES_COLLECTION, FlatmateDoc, getLocations } from "@/lib/flatmates";
import { findOrCreateConversation } from "@/lib/messages";
import { getFileUrl } from "@/lib/spaces";
import { databases, DB_ID } from "@/lib/appwrite";
import { ArrowLeft, Share2, Flag, ShieldCheck, BadgeCheck } from "lucide-react";

const URGENCY_LABEL: Record<string, string> = {
  "ASAP": "Urgent (ASAP)",
  "This month": "Urgent (this month or next)",
  "Next month": "Next month",
  "Flexible": "Flexible",
};

const URGENCY_STYLE: Record<string, { bg: string; text: string }> = {
  "ASAP": { bg: "#fef9c3", text: "#854d0e" },
  "This month": { bg: "#dcfce7", text: "#166534" },
  "Next month": { bg: "#dbeafe", text: "#1e40af" },
  "Flexible": { bg: "#f3f4f6", text: "#4b5563" },
};

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "ACTIVE TODAY";
  if (days === 1) return "ACTIVE YESTERDAY";
  if (days <= 7) return "ACTIVE THIS WEEK";
  return `ACTIVE ${new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()}`;
}

export default function FlatmateProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [flatmate, setFlatmate] = useState<FlatmateDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    if (!id) return;
    databases.getDocument(DB_ID, FLATMATES_COLLECTION, id as string)
      .then(doc => setFlatmate(doc as FlatmateDoc))
      .catch(() => router.push("/flatmates"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMessage = async () => {
    if (!user) { router.push("/login"); return; }
    if (!flatmate) return;
    setStartingChat(true);
    try {
      const conv = await findOrCreateConversation(
        user.$id, user.name,
        flatmate.userId, flatmate.name,
        "flatmate", flatmate.$id, flatmate.name
      );
      router.push(`/messages/${conv.$id}`);
    } catch (e: any) { alert(e.message); }
    finally { setStartingChat(false); }
  };

  if (loading) return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40 }}>
        <div>
          <div style={{ width: 84, height: 84, borderRadius: "50%", background: "var(--surface)", marginBottom: 20 }} />
          <div style={{ height: 28, background: "var(--surface)", borderRadius: 8, width: "40%", marginBottom: 12 }} />
          <div style={{ height: 16, background: "var(--surface)", borderRadius: 8, width: "60%", marginBottom: 8 }} />
          <div style={{ height: 16, background: "var(--surface)", borderRadius: 8, width: "80%" }} />
        </div>
        <div style={{ height: 280, background: "var(--surface)", borderRadius: 16 }} />
      </div>
    </div>
  );

  if (!flatmate) return null;

  const locations = getLocations(flatmate);
  const urg = URGENCY_STYLE[flatmate.urgency] ?? URGENCY_STYLE["Flexible"];
  const isOwn = user?.$id === flatmate.userId;

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Back */}
        <Link href="/flatmates" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--muted)", textDecoration: "none", marginBottom: 32 }}>
          <ArrowLeft size={15} /> Back to flatmates
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 48, alignItems: "start" }}>

          {/* ── LEFT ── */}
          <div>
            {/* Avatar */}
            {flatmate.avatarId ? (
              <div style={{ width: 84, height: 84, borderRadius: "50%", overflow: "hidden", border: "3px solid var(--green)", marginBottom: 20 }}>
                <img src={getFileUrl(flatmate.avatarId)} alt={flatmate.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <div style={{ width: 84, height: 84, borderRadius: "50%", background: flatmate.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 800, color: "#1a1a1a", marginBottom: 20 }}>
                {flatmate.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Name + actions */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 10 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--dark)" }}>Hi, I'm {flatmate.name}</h1>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "white", fontSize: 13, fontWeight: 600, color: "var(--muted)", cursor: "pointer" }}>
                  <Share2 size={13} /> Share
                </button>
                <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", fontSize: 13, fontWeight: 600, color: "#dc2626", cursor: "pointer" }}>
                  <Flag size={13} /> Report
                </button>
              </div>
            </div>

            {/* Active badge + age/gender */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: "var(--green-light)", color: "var(--green)" }}>
                {timeAgo(flatmate.$createdAt)}
              </span>
              <span style={{ fontSize: 15, color: "var(--muted)", fontWeight: 500 }}>
                {flatmate.occupation && <span style={{ fontSize: 15, color: "var(--muted)" }}>{flatmate.occupation} · </span>}{flatmate.age} · {flatmate.gender !== "Any" ? flatmate.gender : ""}
              </span>
            </div>

            {/* Occupation */}
            {flatmate.occupation && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>Work</p>
                <p style={{ fontSize: 15, color: "var(--text)", fontWeight: 500 }}>{flatmate.occupation}</p>
              </div>
            )}

            {/* Introduction */}
            {flatmate.bio && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Introduction</p>
                <p style={{ fontSize: 15, color: "var(--text)", lineHeight: 1.75 }}>{flatmate.bio}</p>
              </div>
            )}

            {/* Urgency tag */}
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 8, background: urg.bg, color: urg.text }}>
                {flatmate.urgency.toUpperCase()}
              </span>
            </div>

            {/* Verification */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>Verification Badge</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BadgeCheck size={16} color="white" />
                </div>
                {isOwn ? "Identity Verified" : "Unverified — ask them to verify"}
              </div>
            </div>

            {/* Safety tips */}
            <div style={{ border: "1.5px solid #fecaca", borderLeft: "4px solid #ef4444", borderRadius: 10, padding: "16px 20px", background: "#fff5f5" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.5px" }}>Safety Tips</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { bold: "Never", rest: " visit a house or meet anyone alone" },
                  { bold: "", rest: "Do not make any upfront payment as inspection fee or rent before seeing the property or meeting the lister physically." },
                  { bold: "", rest: "Please flag suspicious behavior" },
                ].map(({ bold, rest }, i) => (
                  <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "#374151", lineHeight: 1.55 }}>
                    <span style={{ color: "#dc2626", flexShrink: 0, marginTop: 1 }}>·</span>
                    <span>{bold && <strong>{bold}</strong>}{rest}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── RIGHT — renter info card ── */}
          <div style={{ position: "sticky", top: 80 }}>
            <div style={{ border: "1.5px solid var(--border)", borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
              {/* Card header */}
              <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--dark)" }}>My renter info</h2>
              </div>

              {/* Info rows */}
              <div style={{ padding: "0 20px" }}>
                {/* Urgency */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", paddingTop: 2 }}>Urgency</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--dark)", textAlign: "right", maxWidth: "60%" }}>
                    {URGENCY_LABEL[flatmate.urgency]}
                  </span>
                </div>

                {/* Budget */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px" }}>Budget</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--dark)" }}>
                    ₦{flatmate.budgetMin.toLocaleString()} – ₦{flatmate.budgetMax.toLocaleString()}
                  </span>
                </div>

                {/* Neighbourhoods */}
                {locations.length > 0 && (
                  <div style={{ padding: "16px 0" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: 10 }}>Neighbourhoods</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {locations.map(l => (
                        <span key={l} style={{ fontSize: 13, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", padding: "4px 12px", borderRadius: 20, fontWeight: 500 }}>
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Start a chat button */}
            {!isOwn && (
              <button
                onClick={handleMessage}
                onMouseEnter={e => { if (!startingChat) e.currentTarget.style.background = "var(--green-mid)"; }}
                onMouseLeave={e => { if (!startingChat) e.currentTarget.style.background = "var(--green)"; }}
                disabled={startingChat}
              >
                {startingChat ? "Opening chat..." : "Start a chat"}
              </button>
            )}

            {isOwn && (
              <div style={{ background: "var(--green-light)", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "var(--green)", fontWeight: 600, textAlign: "center" }}>
                ✅ This is your profile
              </div>
            )}

            {!user && (
              <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginTop: 10 }}>
                <Link href="/login" style={{ color: "var(--green)", fontWeight: 600 }}>Log in</Link> or{" "}
                <Link href="/signup" style={{ color: "var(--green)", fontWeight: 600 }}>sign up</Link> to start a chat
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
