import Link from "next/link";
import { SpaceDoc, getImageUrl } from "@/lib/spaces";
import { MapPin, Users, Star } from "lucide-react";

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  office:    { bg: "#dbeafe", text: "#1d4ed8" },
  apartment: { bg: "#d1fae5", text: "#065f46" },
  hostel:    { bg: "#fed7aa", text: "#c2410c" },
  hotel:     { bg: "#ede9fe", text: "#6d28d9" },
};

export default function SpaceCard({ space }: { space: SpaceDoc }) {
  const colors = TYPE_COLORS[space.type] ?? { bg: "#f3f4f6", text: "#374151" };
  return (
    <Link href={`/spaces/${space.$id}`} style={{ textDecoration: "none", display: "block" }}>
      <div className="card card-hover" style={{ cursor: "pointer" }}>
        <div style={{ position: "relative", height: 200, background: "var(--surface)", overflow: "hidden" }}>
          {space.imageId ? (
            <img src={getImageUrl(space.imageId)} alt={space.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, background: "linear-gradient(135deg, var(--green-light), var(--accent-light))" }}>
              {space.type === "office" ? "🏢" : space.type === "apartment" ? "🏠" : space.type === "hostel" ? "🛏️" : "🏨"}
            </div>
          )}
          <div style={{ position: "absolute", top: 12, left: 12 }}>
            <span style={{ background: colors.bg, color: colors.text, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>
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
            {space.amenities.length > 3 && <span style={{ fontSize: 11, color: "var(--muted)" }}>+{space.amenities.length - 3}</span>}
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
