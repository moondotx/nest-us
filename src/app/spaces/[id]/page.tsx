"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSpace, getFileUrl, SpaceDoc, incrementViews } from "@/lib/spaces";
import { findOrCreateConversation } from "@/lib/messages";
import { createBooking, checkAvailability } from "@/lib/bookings";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Users, CheckCircle, ArrowLeft, Share2, Flag, Eye, Play, ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";

const TYPE_EMOJI: Record<string, string> = {
  office: "🏢", apartment: "🏠", hostel: "🛏️", hotel: "🏨",
};

function isVideo(url: string) {
  return /\.(mp4|mov|webm|avi|mkv)/i.test(url);
}

function MediaThumb({ url, active, onClick }: { url: string; active: boolean; onClick: () => void }) {
  const video = isVideo(url);
  return (
    <button onClick={onClick} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: `2.5px solid ${active ? "var(--green)" : "transparent"}`, cursor: "pointer", padding: 0, background: "none", flexShrink: 0, width: 72, height: 56 }}>
      {video ? (
        <div style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Play size={18} color="white" fill="white" />
        </div>
      ) : (
        <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}
    </button>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ urls, index, onClose, onNav }: { urls: string[]; index: number; onClose: () => void; onNav: (i: number) => void }) {
  const url = urls[index];
  const video = isVideo(url);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && index > 0) onNav(index - 1);
      if (e.key === "ArrowRight" && index < urls.length - 1) onNav(index + 1);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [index]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <X size={20} color="white" />
      </button>
      <span style={{ position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{index + 1} / {urls.length}</span>

      {index > 0 && (
        <button onClick={e => { e.stopPropagation(); onNav(index - 1); }} style={{ position: "absolute", left: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronLeft size={22} color="white" />
        </button>
      )}
      {index < urls.length - 1 && (
        <button onClick={e => { e.stopPropagation(); onNav(index + 1); }} style={{ position: "absolute", right: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ChevronRight size={22} color="white" />
        </button>
      )}

      <div onClick={e => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "85vh" }}>
        {video ? (
          <video src={url} controls autoPlay style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 12 }} />
        ) : (
          <img src={url} alt="" style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 12, objectFit: "contain" }} />
        )}
      </div>
    </div>
  );
}

// ── Detail row ────────────────────────────────────────────────────────────────
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 24, padding: "13px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ width: 110, flexShrink: 0, fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 600, color: "var(--dark)" }}>{value}</span>
    </div>
  );
}

export default function SpaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [space, setSpace] = useState<SpaceDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState("");
  const [views, setViews] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    if (!id) return;
    getSpace(id as string)
      .then(s => {
        setSpace(s);
        const currentViews = s.views ?? 0;
        setViews(currentViews + 1);
        incrementViews(s.$id, currentViews);
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    } catch {
      // fallback for older browsers
      const el = document.createElement("input");
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const handleMessage = async () => {
    if (!user) { router.push("/login"); return; }
    if (!space) return;
    setStartingChat(true);
    try {
      const conv = await findOrCreateConversation(
        user.$id, user.name,
        space.hostId, space.hostName,
        "space", space.$id, space.title
      );
      router.push(`/messages/${conv.$id}`);
    } catch (e: any) {
      alert(e.message);
    } finally { setStartingChat(false); }
  };

  const calcHours = () => {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
  };
  const hours = calcHours();
  const total = hours * (space?.price ?? 0);

  const handleBook = async () => {
    if (!user) { router.push("/login"); return; }
    if (!date || hours <= 0) { setError("Please select a valid date and time range."); return; }
    setError(""); setBooking(true);
    try {
      const available = await checkAvailability(space!.$id, date, startTime, endTime);
      if (!available) { setError("Slot already booked. Try another time."); setBooking(false); return; }
      await createBooking({
        spaceId: space!.$id, spaceName: space!.title, spaceType: space!.type,
        spaceLocation: space!.location, userId: user.$id, userName: user.name,
        userEmail: user.email, date, startTime, endTime, hours,
        totalPrice: total, status: "confirmed", hostId: space!.hostId,
      });
      setBooked(true);
    } catch (e: any) { setError(e.message); }
    finally { setBooking(false); }
  };

  if (loading) return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ height: 420, background: "var(--surface)", borderRadius: 16, marginBottom: 24 }} />
    </div>
  );
  if (!space) return null;

  // Build media URLs — prefer mediaIds, fall back to imageId
  const mediaUrls: string[] = space.mediaIds?.length
    ? space.mediaIds.map(getFileUrl)
    : space.imageId ? [getFileUrl(space.imageId)] : [];

  const activeUrl = mediaUrls[activeIdx];
  const activeIsVideo = activeUrl ? isVideo(activeUrl) : false;
  const postedDate = new Date(space.$createdAt).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  const hostInitial = space.hostName?.charAt(0).toUpperCase() ?? "H";
  const hostJoinMonth = new Date(space.$createdAt).toLocaleString("en-US", { month: "short" }).toUpperCase();

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      {lightbox !== null && (
        <Lightbox urls={mediaUrls} index={lightbox} onClose={() => setLightbox(null)} onNav={setLightbox} />
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 64px" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--muted)", textDecoration: "none" }}>
            <ArrowLeft size={15} /> Back to listings
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13, color: "var(--muted)" }}>
            <span>Posted: {postedDate}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Eye size={13} /> {views} {views === 1 ? "View" : "Views"}</span>
            <div style={{ position: "relative" }}>
              <button onClick={handleShare} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: shareCopied ? "var(--green)" : "var(--muted)", fontSize: 13, fontWeight: 500 }}>
                <Share2 size={14} /> {shareCopied ? "Link copied!" : "Share"}
              </button>
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 13, fontWeight: 500 }}>
              <Flag size={14} /> Report
            </button>
          </div>
        </div>

        {/* ── MEDIA GALLERY ── */}
        <div style={{ marginBottom: 32 }}>
          {/* Main viewer */}
          <div onClick={() => mediaUrls.length > 0 && setLightbox(activeIdx)}
            style={{ position: "relative", height: 420, background: "var(--surface)", borderRadius: 16, overflow: "hidden", cursor: mediaUrls.length > 0 ? "zoom-in" : "default", marginBottom: 10 }}>
            {mediaUrls.length === 0 ? (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80 }}>
                {TYPE_EMOJI[space.type]}
              </div>
            ) : activeIsVideo ? (
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <video src={activeUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted onClick={e => e.stopPropagation()} controls />
                <div onClick={() => setLightbox(activeIdx)} style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.5)", borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "white", fontWeight: 600, cursor: "pointer" }}>
                  ⛶ Fullscreen
                </div>
              </div>
            ) : (
              <img src={activeUrl} alt={space.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}

            {/* Nav arrows on main viewer */}
            {mediaUrls.length > 1 && (
              <>
                {activeIdx > 0 && (
                  <button onClick={e => { e.stopPropagation(); setActiveIdx(i => i - 1); }}
                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronLeft size={18} />
                  </button>
                )}
                {activeIdx < mediaUrls.length - 1 && (
                  <button onClick={e => { e.stopPropagation(); setActiveIdx(i => i + 1); }}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronRight size={18} />
                  </button>
                )}
                <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.5)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "white", fontWeight: 600 }}>
                  {activeIdx + 1} / {mediaUrls.length}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {mediaUrls.length > 1 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {mediaUrls.map((url, i) => (
                <MediaThumb key={i} url={url} active={i === activeIdx} onClick={() => setActiveIdx(i)} />
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40, alignItems: "start" }}>
          {/* LEFT */}
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--dark)", marginBottom: 20, lineHeight: 1.3 }}>{space.title}</h1>

            <div style={{ marginBottom: 28 }}>
              <Row label="PRICE" value={`$${space.price} / hour`} />
              <Row label="TYPE" value={space.type.charAt(0).toUpperCase() + space.type.slice(1)} />
              <Row label="CAPACITY" value={`${space.capacity} people`} />
              <Row label="AVAILABLE" value={space.availability || "Flexible hours"} />
              <Row label="ADDRESS" value={space.location} />
              {space.rating > 0 && <Row label="RATING" value={`${space.rating.toFixed(1)} ★ (${space.reviewCount} reviews)`} />}
            </div>

            {space.description && (
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--dark)", marginBottom: 10 }}>About this space</h2>
                <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.7 }}>{space.description}</p>
              </div>
            )}

            {space.amenities.length > 0 && (
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--dark)", marginBottom: 12 }}>Amenities</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {space.amenities.map(a => (
                    <div key={a} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "var(--green-light)", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "var(--green)" }}>
                      <CheckCircle size={13} /> {a}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — host + booking */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ border: "1.5px solid var(--border)", borderRadius: 16, padding: 20, background: "white" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>Posted by</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--green)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700 }}>
                  {hostInitial}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "var(--dark)" }}>{space.hostName}</span>
                    <span style={{ fontSize: 11, background: "var(--accent-light)", color: "#92400e", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>{hostJoinMonth}</span>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>HOST</span>
                </div>
              </div>

              {booked ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <CheckCircle size={40} color="var(--green)" style={{ margin: "0 auto 12px", display: "block" }} />
                  <p style={{ fontWeight: 700, fontSize: 16, color: "var(--dark)", marginBottom: 4 }}>Booking confirmed!</p>
                  <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Check your bookings page.</p>
                  <Link href="/bookings" style={{ display: "block", textAlign: "center", padding: "12px", background: "var(--green)", color: "white", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>View bookings</Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5, textTransform: "uppercase" }}>Date</label>
                    <input type="date" className="input" value={date} min={new Date().toISOString().split("T")[0]} onChange={e => setDate(e.target.value)} style={{ fontSize: 14 }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5, textTransform: "uppercase" }}>From</label>
                      <input type="time" className="input" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ fontSize: 14 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 5, textTransform: "uppercase" }}>To</label>
                      <input type="time" className="input" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ fontSize: 14 }} />
                    </div>
                  </div>
                  {hours > 0 && (
                    <div style={{ background: "var(--green-light)", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", marginBottom: 4 }}>
                        <span>${space.price} × {hours.toFixed(1)} hrs</span><span>${total.toFixed(0)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--green)", borderTop: "1px solid rgba(26,107,60,0.15)", paddingTop: 6 }}>
                        <span>Total</span><span>${total.toFixed(0)}</span>
                      </div>
                    </div>
                  )}
                  {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}
                  <button onClick={handleBook} disabled={booking}
                    style={{ padding: "13px", background: "var(--green)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: booking ? "not-allowed" : "pointer", opacity: booking ? 0.7 : 1 }}>
                    {booking ? "Booking..." : user ? "Book this space" : "Log in to book"}
                  </button>
                  {!user && (
                    <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted)" }}>
                      <Link href="/login" style={{ color: "var(--green)", fontWeight: 600 }}>Log in</Link> or <Link href="/signup" style={{ color: "var(--green)", fontWeight: 600 }}>sign up</Link> to book
                    </p>
                  )}
                </div>
              )}
            </div>

            <button onClick={handleMessage} disabled={startingChat}
              style={{ width: "100%", padding: "13px", background: "white", color: "var(--green)", border: "1.5px solid var(--green)", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: startingChat ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: startingChat ? 0.7 : 1 }}>
              💬 {startingChat ? "Opening chat..." : "Message host"}
            </button>

            <div style={{ background: "var(--surface)", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
              <span style={{ fontWeight: 800, fontSize: 22, color: "var(--green)" }}>${space.price}</span>
              <span> / hour · up to {space.capacity} people</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
