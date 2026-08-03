"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { createFlatmate, randomAvatarColor, AVATAR_COLORS } from "@/lib/flatmates";
import { uploadFile, getFileUrl } from "@/lib/spaces";
import { ArrowLeft, X, Camera, Upload } from "lucide-react";

const LAGOS_AREAS = [
  "Lekki", "Victoria Island", "Ikoyi", "Yaba", "Surulere", "Ikeja",
  "Ajah", "Gbagada", "Magodo", "Maryland", "Ojota", "Bariga",
  "Shomolu", "Ketu", "Agege", "Festac", "Isale Eko",
];

const Label = ({ text }: { text: string }) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>{text}</label>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
    <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--dark)" }}>{title}</h2>
    {children}
  </div>
);

export default function NewFlatmatePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "", age: "", gender: "Any" as "Male" | "Female" | "Any",
    occupation: "", bio: "", budgetMin: "", budgetMax: "",
    urgency: "Flexible" as "ASAP" | "This month" | "Next month" | "Flexible",
    avatarColor: randomAvatarColor(),
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [customLocation, setCustomLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const toggleLocation = (l: string) =>
    setSelectedLocations(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);
  const addCustomLocation = () => {
    const val = customLocation.trim();
    if (val && !selectedLocations.includes(val)) {
      setSelectedLocations(p => [...p, val]);
      setCustomLocation("");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push("/login"); return; }
    if (!form.name || !form.age || !form.budgetMin || !form.budgetMax) {
      setError("Please fill all required fields."); return;
    }
    setError(""); setSubmitting(true);
    try {
      let avatarId: string | null = null;
      if (avatarFile) avatarId = await uploadFile(avatarFile);

      await createFlatmate({
        userId: user.$id, name: form.name, age: Number(form.age),
        gender: form.gender, occupation: form.occupation, bio: form.bio,
        budgetMin: Number(form.budgetMin), budgetMax: Number(form.budgetMax),
        locations: JSON.stringify(selectedLocations),
        urgency: form.urgency, avatarColor: form.avatarColor,
        avatarId,
      });
      router.push("/flatmates");
    } catch (err: any) {
      setError(err.message ?? "Failed to create profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (!user) { router.push("/login"); return null; }

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "32px 24px 64px" }}>
      <Link href="/flatmates" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--muted)", textDecoration: "none", marginBottom: 24 }}>
        <ArrowLeft size={15} /> Back to flatmates
      </Link>

      <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--dark)", marginBottom: 4 }}>Post your flatmate profile</h1>
      <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 32 }}>Tell people who you are and what you're looking for</p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── AVATAR UPLOAD ── */}
        <Section title="Profile photo">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* Avatar preview */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              {avatarPreview ? (
                <div style={{ width: 90, height: 90, borderRadius: "50%", overflow: "hidden", border: "3px solid var(--green)" }}>
                  <img src={avatarPreview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ width: 90, height: 90, borderRadius: "50%", background: form.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#1a1a1a", border: "3px solid transparent" }}>
                  {form.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              {/* Camera button */}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: "var(--green)", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Camera size={13} color="white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--dark)", marginBottom: 4 }}>
                {avatarPreview ? "Looking great! 👍" : "Add a photo"}
              </p>
              <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10, lineHeight: 1.5 }}>
                Profiles with photos get 3× more responses. JPG or PNG, max 5MB.
              </p>
              {avatarPreview ? (
                <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
                  style={{ fontSize: 12, color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  <X size={12} /> Remove photo
                </button>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", border: "1.5px solid var(--border)", borderRadius: 8, background: "white", fontSize: 13, fontWeight: 600, color: "var(--text)", cursor: "pointer" }}>
                  <Upload size={13} /> Upload photo
                </button>
              )}
            </div>
          </div>

          {/* Fallback colour picker (shown only when no photo) */}
          {!avatarPreview && (
            <div>
              <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Or pick an avatar colour:</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {AVATAR_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => set("avatarColor", c)}
                    style={{ width: 30, height: 30, borderRadius: "50%", background: c, border: `3px solid ${form.avatarColor === c ? "var(--green)" : "transparent"}`, cursor: "pointer", transition: "border 0.15s" }} />
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* About you */}
        <Section title="About you">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <Label text="Full name *" />
              <input className="input" placeholder="Ada Okonkwo" value={form.name} onChange={e => set("name", e.target.value)} required />
            </div>
            <div>
              <Label text="Age *" />
              <input type="number" className="input" placeholder="25" min={18} max={99} value={form.age} onChange={e => set("age", e.target.value)} required />
            </div>
          </div>

          <div>
            <Label text="Gender" />
            <div style={{ display: "flex", gap: 8 }}>
              {(["Male", "Female", "Any"] as const).map(g => (
                <button key={g} type="button" onClick={() => set("gender", g)}
                  style={{ flex: 1, padding: "9px", borderRadius: 10, border: `1.5px solid ${form.gender === g ? "var(--green)" : "var(--border)"}`, background: form.gender === g ? "var(--green-light)" : "white", color: form.gender === g ? "var(--green)" : "var(--muted)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label text="Occupation" />
            <input className="input" placeholder="e.g. Software Engineer, Student, Nurse..." value={form.occupation} onChange={e => set("occupation", e.target.value)} />
          </div>

          <div>
            <Label text="Short bio (optional)" />
            <textarea className="input" rows={3} style={{ resize: "none" }}
              placeholder="Tell potential flatmates about yourself — your routine, personality..."
              value={form.bio} onChange={e => set("bio", e.target.value)} />
          </div>
        </Section>

        {/* Budget */}
        <Section title="Budget">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <Label text="Min (₦) *" />
              <input type="number" className="input" placeholder="300,000" value={form.budgetMin} onChange={e => set("budgetMin", e.target.value)} required />
            </div>
            <div>
              <Label text="Max (₦) *" />
              <input type="number" className="input" placeholder="700,000" value={form.budgetMax} onChange={e => set("budgetMax", e.target.value)} required />
            </div>
          </div>
        </Section>

        {/* Urgency */}
        <Section title="When do you need to move?">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {(["ASAP", "This month", "Next month", "Flexible"] as const).map(u => (
              <button key={u} type="button" onClick={() => set("urgency", u)}
                style={{ padding: "11px", borderRadius: 10, border: `1.5px solid ${form.urgency === u ? "var(--green)" : "var(--border)"}`, background: form.urgency === u ? "var(--green-light)" : "white", color: form.urgency === u ? "var(--green)" : "var(--muted)", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}>
                {u}
              </button>
            ))}
          </div>
        </Section>

        {/* Preferred locations */}
        <Section title="Preferred locations">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LAGOS_AREAS.map(l => (
              <button key={l} type="button" onClick={() => toggleLocation(l)}
                style={{ padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${selectedLocations.includes(l) ? "var(--green)" : "var(--border)"}`, background: selectedLocations.includes(l) ? "var(--green-light)" : "white", color: selectedLocations.includes(l) ? "var(--green)" : "var(--muted)", fontWeight: 600, fontSize: 12, cursor: "pointer", transition: "all 0.15s" }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="input" placeholder="Add another area..." value={customLocation}
              onChange={e => setCustomLocation(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomLocation(); }}} />
            <button type="button" onClick={addCustomLocation}
              style={{ padding: "0 16px", background: "var(--green)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              Add
            </button>
          </div>
          {selectedLocations.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {selectedLocations.map(l => (
                <span key={l} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, background: "var(--green-light)", color: "var(--green)", padding: "4px 10px", borderRadius: 20, fontWeight: 600 }}>
                  {l}
                  <button type="button" onClick={() => toggleLocation(l)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
                    <X size={11} color="var(--green)" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Section>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 14, borderRadius: 10, padding: "12px 16px" }}>{error}</div>
        )}

        <button type="submit" disabled={submitting}
          style={{ padding: "14px", background: submitting ? "var(--muted)" : "var(--green)", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: submitting ? "not-allowed" : "pointer" }}>
          {submitting ? "Posting..." : "Post profile"}
        </button>
      </form>
    </div>
  );
}
