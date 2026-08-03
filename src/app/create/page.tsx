"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Home } from "lucide-react";

export default function CreatePage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: "100vh", background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 440, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>

        {/* Hero banner */}
        <div style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", padding: "36px 32px 32px", textAlign: "center" }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "white", marginBottom: 8, letterSpacing: "-0.5px" }}>
            Find Your Perfect Match
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.82)", lineHeight: 1.5 }}>
            Connect with the right people for your living situation
          </p>
        </div>

        {/* Options */}
        <div style={{ padding: "28px 28px 8px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Find Flatmates */}
          <div style={{ border: "1.5px solid #e8e8f0", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 14, transition: "border-color 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "#6366f1"; el.style.boxShadow = "0 4px 20px rgba(99,102,241,0.1)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "#e8e8f0"; el.style.boxShadow = "none"; }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Users size={20} color="#6366f1" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>Find Flatmates</h3>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.55 }}>Discover compatible people looking to share a home</p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link href="/flatmates/new" style={{ padding: "9px 22px", background: "#6366f1", color: "white", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                Get Started
              </Link>
            </div>
          </div>

          {/* List a space */}
          <div style={{ border: "1.5px solid #e8e8f0", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 14, transition: "border-color 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "var(--green)"; el.style.boxShadow = "0 4px 20px rgba(26,107,60,0.1)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "#e8e8f0"; el.style.boxShadow = "none"; }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--green-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Home size={20} color="var(--green)" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>List Your Space</h3>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.55 }}>Rent out your apartment, office, hostel or hotel room to vetted renters</p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link href="/list-space" style={{ padding: "9px 22px", background: "var(--green)", color: "white", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                List Now
              </Link>
            </div>
          </div>
        </div>

        {/* Cancel */}
        <div style={{ padding: "16px 28px 28px", textAlign: "center" }}>
          <button onClick={() => router.back()}
            style={{ background: "none", border: "none", fontSize: 14, color: "#9ca3af", cursor: "pointer", fontWeight: 500 }}>
            Not sure yet? Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
