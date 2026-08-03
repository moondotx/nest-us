"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { listFlatmates, FlatmateDoc, getLocations, getMyFlatmateProfile, deleteFlatmate } from "@/lib/flatmates";
import { getFileUrl } from "@/lib/spaces";
import { MapPin, Plus, BadgeCheck, Trash2 } from "lucide-react";

const URGENCY_STYLE: Record<string, { bg: string; text: string }> = {
  "ASAP":       { bg: "#fef9c3", text: "#854d0e" },
  "This month": { bg: "#dcfce7", text: "#166534" },
  "Next month": { bg: "#dbeafe", text: "#1e40af" },
  "Flexible":   { bg: "#f3f4f6", text: "#4b5563" },
};

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "TODAY";
  if (days === 1) return "YESTERDAY";
  if (days <= 7) return "LAST WEEK";
  if (days <= 30) return "LAST MONTH";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function FlatmateCard({ f, isOwner, onDelete }: { f: FlatmateDoc; isOwner?: boolean; onDelete?: () => void }) {
  const locations = getLocations(f);
  const urg = URGENCY_STYLE[f.urgency] ?? URGENCY_STYLE["Flexible"];

  return (
    <Link href={`/flatmates/${f.$id}`} style={{ textDecoration: "none", display: "block" }}>
    <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 14, position: "relative", transition: "box-shadow 0.2s, transform 0.2s", cursor: "pointer" }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.1)"; el.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = "none"; el.style.transform = "none"; }}>

      {isOwner && onDelete && (
        <button onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete && onDelete(); }} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 4 }}>
          <Trash2 size={14} />
        </button>
      )}

      {/* Avatar + name */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        {f.avatarId ? (
          <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--border)" }}>
            <img src={getFileUrl(f.avatarId)} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: f.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#1a1a1a" }}>
            {f.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--dark)" }}>{f.name}</span>
          <span style={{ fontSize: 14, color: "var(--muted)" }}> · {f.age}</span>
          {f.occupation && (
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{f.occupation}</p>
          )}
          {f.gender !== "Any" && (
            <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 1, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" }}>{f.gender}</p>
          )}
        </div>
      </div>

      {/* Bio */}
      {f.bio && (
        <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, textAlign: "center", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {f.bio}
        </p>
      )}

      {/* Looking label + time */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Looking:</span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: urg.bg, color: urg.text }}>
          {timeAgo(f.$createdAt)}
        </span>
      </div>

      {/* Budget */}
      <div style={{ background: "var(--surface)", borderRadius: 8, padding: "10px 14px", fontSize: 15, fontWeight: 700, color: "var(--dark)", textAlign: "center" }}>
        ₦{f.budgetMin.toLocaleString()} – ₦{f.budgetMax.toLocaleString()}
      </div>

      {/* Urgency badge */}
      <span style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 8, background: urg.bg, color: urg.text, alignSelf: "flex-start" }}>
        {f.urgency.toLowerCase()}
      </span>

      {/* Locations */}
      {locations.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {locations.slice(0, 3).map(l => (
            <span key={l} style={{ fontSize: 12, background: "var(--green-light)", color: "var(--green)", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>{l}</span>
          ))}
          {locations.length > 3 && (
            <span style={{ fontSize: 12, color: "var(--muted)", padding: "3px 4px" }}>+{locations.length - 3}</span>
          )}
        </div>
      )}
    </div>
    </Link>
  );
}

export default function FlatmatesPage() {
  const { user } = useAuth();
  const [flatmates, setFlatmates] = useState<FlatmateDoc[]>([]);
  const [myProfile, setMyProfile] = useState<FlatmateDoc | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [locationFilter, setLocationFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("Any");
  const [budgetMax, setBudgetMax] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("All");

  const load = async () => {
    setLoading(true);
    const [all, mine] = await Promise.all([
      listFlatmates(),
      user ? getMyFlatmateProfile(user.$id) : Promise.resolve(null),
    ]);
    setFlatmates(all);
    setMyProfile(mine);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove your flatmate profile?")) return;
    await deleteFlatmate(id);
    setMyProfile(null);
    setFlatmates(prev => prev.filter(f => f.$id !== id));
  };

  const filtered = flatmates.filter(f => {
    const locs = getLocations(f).join(" ").toLowerCase();
    const matchLoc = !locationFilter || locs.includes(locationFilter.toLowerCase());
    const matchGender = genderFilter === "Any" || f.gender === genderFilter || f.gender === "Any";
    const matchBudget = !budgetMax || f.budgetMin <= Number(budgetMax);
    const matchUrgency = urgencyFilter === "All" || f.urgency === urgencyFilter;
    return matchLoc && matchGender && matchBudget && matchUrgency;
  });

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "32px 24px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--dark)", marginBottom: 4 }}>Flatmates</h1>
              <p style={{ fontSize: 14, color: "var(--muted)" }}>Find people looking for shared apartments across Nigeria</p>
            </div>
            {user && !myProfile ? (
              <Link href="/flatmates/new" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "var(--green)", color: "white", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                <Plus size={16} /> Post your profile
              </Link>
            ) : user && myProfile ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "var(--green-light)", borderRadius: 10, fontSize: 13, color: "var(--green)", fontWeight: 600 }}>
                <BadgeCheck size={15} /> Your profile is live
              </div>
            ) : (
              <Link href="/signup" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "var(--green)", color: "white", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                <Plus size={16} /> Post your profile
              </Link>
            )}
          </div>

          {/* Filter bar */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid var(--border)", borderRadius: 10, padding: "8px 14px", background: "white", flex: "1 1 160px" }}>
              <MapPin size={14} color="var(--muted)" />
              <input placeholder="Location or city?" value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: 13, color: "var(--text)", background: "transparent", width: "100%" }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1.5px solid var(--border)", borderRadius: 10, padding: "8px 14px", background: "white" }}>
              <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>₦ Max</span>
              <input type="number" placeholder="700,000" value={budgetMax} onChange={e => setBudgetMax(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: 13, color: "var(--text)", background: "transparent", width: 100 }} />
            </div>

            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}
              style={{ border: "1.5px solid var(--border)", borderRadius: 10, padding: "9px 14px", fontSize: 13, background: "white", outline: "none", fontWeight: 600, cursor: "pointer", color: "var(--text)" }}>
              <option value="Any">Gender: Any</option>
              <option>Male</option>
              <option>Female</option>
            </select>

            <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)}
              style={{ border: "1.5px solid var(--border)", borderRadius: 10, padding: "9px 14px", fontSize: 13, background: "white", outline: "none", fontWeight: 600, cursor: "pointer", color: "var(--text)" }}>
              <option value="All">Urgency: All</option>
              <option>ASAP</option>
              <option>This month</option>
              <option>Next month</option>
              <option>Flexible</option>
            </select>
          </div>
        </div>
      </div>

      {/* Safety tip */}
      <div style={{ background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", padding: "10px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", gap: 8 }}>
          <BadgeCheck size={15} color="var(--green)" />
          <p style={{ fontSize: 13, color: "var(--green)", fontWeight: 500 }}>
            <strong>Safety tip:</strong> Always meet in a public place first before agreeing to share a space.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 64px" }}>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>{filtered.length} people looking for flatmates</p>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ height: 300, background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>👥</p>
            <p style={{ fontWeight: 700, fontSize: 18, color: "var(--dark)", marginBottom: 4 }}>No flatmates found</p>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 20 }}>Be the first to post a profile!</p>
            <Link href="/flatmates/new" style={{ display: "inline-flex", padding: "10px 24px", background: "var(--green)", color: "white", borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
              Post your profile
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
            {filtered.map(f => (
              <FlatmateCard key={f.$id} f={f} isOwner={user?.$id === f.userId} onDelete={() => handleDelete(f.$id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
