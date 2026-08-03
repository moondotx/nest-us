"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { listSpaces, SpaceDoc, getImageUrl } from "@/lib/spaces";
import { Search, MapPin, Users, Star, Shield, ArrowRight, CheckCircle, Building2, Home, BedDouble, Hotel, ChevronRight } from "lucide-react";

const TYPES = [
  { value: "all", label: "All spaces", icon: "🏘️" },
  { value: "office", label: "Offices", icon: "🏢" },
  { value: "apartment", label: "Apartments", icon: "🏠" },
  { value: "hostel", label: "Hostels", icon: "🛏️" },
  { value: "hotel", label: "Hotels", icon: "🏨" },
];

const LOCATIONS = ["All areas", "Victoria Island", "Lekki", "Yaba", "Ikeja", "Surulere", "Ikoyi", "Ajah"];

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  office:    { bg: "#dbeafe", text: "#1d4ed8" },
  apartment: { bg: "#d1fae5", text: "#065f46" },
  hostel:    { bg: "#fed7aa", text: "#c2410c" },
  hotel:     { bg: "#ede9fe", text: "#6d28d9" },
};

function SpaceCard({ space }: { space: SpaceDoc }) {
  const colors = TYPE_COLORS[space.type] ?? { bg: "#f3f4f6", text: "#374151" };
  return (
    <Link href={`/spaces/${space.$id}`} style={{ textDecoration: "none", display: "block" }}>
      <div className="card card-hover" style={{ cursor: "pointer" }}>
        <div style={{ position: "relative", height: 200, background: "var(--surface)", overflow: "hidden" }}>
          {space.imageId ? (
            <img src={getImageUrl(space.imageId)} alt={space.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, background: "linear-gradient(135deg, var(--green-light), var(--accent-light))" }}>
              {space.type === "office" ? "🏢" : space.type === "apartment" ? "🏠" : space.type === "hostel" ? "🛏️" : "🏨"}
            </div>
          )}
          <div style={{ position: "absolute", top: 12, left: 12 }}>
            <span style={{ ...colors, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>
              {space.type}
            </span>
          </div>
          {space.rating > 0 && (
            <div style={{ position: "absolute", top: 12, right: 12, background: "white", borderRadius: 8, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
              <Star size={12} fill="#f4a427" color="#f4a427" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--dark)" }}>{space.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div style={{ padding: "16px 18px 18px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--dark)", marginBottom: 6, lineHeight: 1.3 }}>{space.title}</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: 13, marginBottom: 12 }}>
            <MapPin size={13} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{space.location}</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {space.amenities.slice(0, 3).map(a => (
              <span key={a} style={{ fontSize: 11, background: "var(--surface)", color: "var(--muted)", padding: "3px 9px", borderRadius: 20, border: "1px solid var(--border)" }}>{a}</span>
            ))}
            {space.amenities.length > 3 && <span style={{ fontSize: 11, color: "var(--muted)" }}>+{space.amenities.length - 3} more</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--muted)" }}>
              <Users size={13} />
              <span>Up to {space.capacity}</span>
            </div>
            <div>
              <span style={{ fontSize: 18, fontWeight: 800, color: "var(--green)" }}>${space.price}</span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>/hr</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: "center", padding: "20px 24px" }}>
      <p style={{ fontSize: 32, fontWeight: 800, color: "var(--green)", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{label}</p>
    </div>
  );
}

export default function HomePage() {
  const [spaces, setSpaces] = useState<SpaceDoc[]>([]);
  const [filter, setFilter] = useState("all");
  const [location, setLocation] = useState("All areas");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    listSpaces(filter)
      .then(setSpaces)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = spaces.filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase());
    const matchLocation = location === "All areas" || s.location.toLowerCase().includes(location.toLowerCase());
    return matchSearch && matchLocation;
  });

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <section style={{ background: "linear-gradient(135deg, #0f2419 0%, #1a6b3c 50%, #0f2419 100%)", padding: "72px 24px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Background pattern */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(244,164,39,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 40%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "6px 14px", marginBottom: 24 }}>
            <Shield size={13} color="#f4a427" />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>Verified listings across Nigeria</span>
          </div>

          <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800, color: "white", lineHeight: 1.15, marginBottom: 16, letterSpacing: "-1px" }}>
            Find your perfect<br />
            <span style={{ color: "#f4a427" }}>space in Nigeria</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.7)", maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.6 }}>
            Book verified office spaces, apartments, hostels and hotels — by the hour or day, anywhere across Lagos and beyond.
          </p>

          {/* Search bar */}
          <div style={{ background: "white", borderRadius: 16, padding: 8, display: "flex", gap: 8, maxWidth: 620, margin: "0 auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "4px 12px" }}>
              <Search size={16} color="var(--muted)" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search spaces, locations..."
                style={{ border: "none", outline: "none", fontSize: 14, color: "var(--text)", width: "100%", background: "transparent" }}
              />
            </div>
            <div style={{ width: 1, background: "var(--border)", margin: "6px 0" }} />
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: 14, color: "var(--text)", background: "transparent", padding: "4px 8px", cursor: "pointer" }}
            >
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>
            <button className="btn-primary" style={{ borderRadius: 10, padding: "10px 20px", whiteSpace: "nowrap" }}>
              Search
            </button>
          </div>

          {/* Quick tags */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
            {["Victoria Island", "Lekki", "Yaba", "Ikeja"].map(loc => (
              <button key={loc} onClick={() => setLocation(loc)} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "5px 14px", fontSize: 12, color: "rgba(255,255,255,0.8)", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ background: "white", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          <StatCard value="500+" label="Active listings" />
          <div style={{ width: 1, background: "var(--border)", margin: "20px 0" }} />
          <StatCard value="2,500+" label="Happy users" />
          <div style={{ width: 1, background: "var(--border)", margin: "20px 0" }} />
          <StatCard value="4.8★" label="Average rating" />
          <div style={{ width: 1, background: "var(--border)", margin: "20px 0" }} />
          <StatCard value="100%" label="Verified hosts" />
        </div>
      </section>

      {/* ── Listings ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--dark)", marginBottom: 4 }}>
              {filter === "all" ? "All available spaces" : `${TYPES.find(t => t.value === filter)?.label}`}
            </h2>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>{filtered.length} spaces found</p>
          </div>

          {/* Type filters */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setFilter(t.value)}
                style={{
                  padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", border: "1.5px solid",
                  background: filter === t.value ? "var(--green)" : "white",
                  color: filter === t.value ? "white" : "var(--muted)",
                  borderColor: filter === t.value ? "var(--green)" : "var(--border)",
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card" style={{ opacity: 0.6 }}>
                <div style={{ height: 200, background: "linear-gradient(90deg, var(--surface) 25%, #eee 50%, var(--surface) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
                <div style={{ padding: 18 }}>
                  <div style={{ height: 16, background: "var(--surface)", borderRadius: 8, marginBottom: 8, width: "70%" }} />
                  <div style={{ height: 12, background: "var(--surface)", borderRadius: 8, width: "50%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: 60, background: "#fef2f2", borderRadius: 16, border: "1px solid #fecaca" }}>
            <p style={{ color: "#dc2626", fontWeight: 600, marginBottom: 4 }}>{error}</p>
            <p style={{ color: "var(--muted)", fontSize: 13 }}>Check your Appwrite configuration</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🏘️</p>
            <p style={{ fontWeight: 700, fontSize: 18, color: "var(--dark)", marginBottom: 4 }}>No spaces found</p>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Try a different filter or location</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {filtered.map(s => <SpaceCard key={s.$id} space={s} />)}
          </div>
        )}
      </section>

      {/* ── How it works ── */}
      <section style={{ background: "var(--surface)", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--dark)", marginBottom: 8 }}>How Nest works</h2>
            <p style={{ color: "var(--muted)", fontSize: 15 }}>Book your perfect space in 3 simple steps</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
            {[
              { step: "01", icon: "🔍", title: "Search & discover", desc: "Browse hundreds of verified office spaces, apartments, hostels and hotels across Nigeria." },
              { step: "02", icon: "📅", title: "Book instantly", desc: "Select your date and time, see the total cost upfront, and confirm your booking in seconds." },
              { step: "03", icon: "✅", title: "Show up & enjoy", desc: "Get a confirmation, arrive at your space, and enjoy a seamless experience every time." },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} style={{ background: "white", borderRadius: 20, padding: "28px 24px", border: "1px solid var(--border)", position: "relative" }}>
                <div style={{ position: "absolute", top: 20, right: 20, fontSize: 13, fontWeight: 800, color: "var(--green-light)", fontFamily: "monospace" }}>{step}</div>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--dark)", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── List your space CTA ── */}
      <section style={{ background: "var(--dark)", padding: "64px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "white", marginBottom: 12, letterSpacing: "-0.5px" }}>
            Have a space to rent?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
            List your office, apartment, hostel or hotel on Nest and start earning. Setup takes less than 5 minutes.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/list-space" className="btn-primary" style={{ padding: "14px 28px", fontSize: 15, textDecoration: "none", borderRadius: 12 }}>
              List your space →
            </Link>
            <Link href="/signup" style={{ padding: "14px 28px", fontSize: 15, textDecoration: "none", borderRadius: 12, background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", fontWeight: 600, display: "inline-flex", alignItems: "center" }}>
              Create free account
            </Link>
          </div>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
            {["Free to list", "No hidden fees", "Instant payouts"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle size={14} color="#4ade80" />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "var(--dark)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "40px 24px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Home size={15} color="white" />
                </div>
                <span style={{ fontWeight: 800, fontSize: 18, color: "white" }}>Nest<span style={{ color: "var(--green)" }}>.</span></span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, maxWidth: 220 }}>
                Nigeria's trusted platform for booking verified spaces.
              </p>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: "white", marginBottom: 14 }}>Spaces</p>
              {["Offices", "Apartments", "Hostels", "Hotels"].map(l => (
                <p key={l} style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 8, cursor: "pointer" }}>{l}</p>
              ))}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: "white", marginBottom: 14 }}>Company</p>
              {["About us", "Blog", "Careers", "Contact"].map(l => (
                <p key={l} style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 8, cursor: "pointer" }}>{l}</p>
              ))}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: "white", marginBottom: 14 }}>Legal</p>
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(l => (
                <p key={l} style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 8, cursor: "pointer" }}>{l}</p>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>© {new Date().getFullYear()} Nest. All rights reserved.</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Built with ❤️ for Nigeria</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
