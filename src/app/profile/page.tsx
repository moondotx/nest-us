"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { account } from "@/lib/appwrite";
import { uploadFile, getFileUrl } from "@/lib/spaces";
import { ArrowLeft, Camera, Bell, User } from "lucide-react";

const LIFESTYLE_OPTIONS = [
  "quiet", "clean", "social", "early riser", "night owl",
  "non-smoker", "smoker", "no pets", "pet-friendly",
  "vegetarian", "student", "working professional", "religious",
];

const GENDERS = ["male", "female", "non-binary", "prefer not to say"];
const ACADEMIC_LEVELS = ["", "SSCE", "OND", "HND", "BSc", "MSc", "PhD"];

const FieldLabel = ({ text }: { text: string }) => (
  <label style={{ fontSize: 13, fontWeight: 500, color: "#6b7280", display: "block", marginBottom: 6 }}>{text}</label>
);

const Input = ({ value, onChange, placeholder, type = "text" }: any) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14, outline: "none", color: "#111827", boxSizing: "border-box", background: "white" }}
    onFocus={e => e.target.style.borderColor = "var(--green)"}
    onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
);

export default function ProfilePage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"basic" | "notifications">("basic");

  const [fullName, setFullName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [workTitle, setWorkTitle] = useState("");
  const [employer, setEmployer] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Notification prefs
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [messageNotifs, setMessageNotifs] = useState(true);
  const [bookingNotifs, setBookingNotifs] = useState(true);

  const toggleLifestyle = (t: string) =>
    setLifestyle(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true); setError(""); setSaved(false);
    try {
      if (fullName && fullName !== user.name) {
        await account.updateName(fullName);
        await refresh();
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;
  if (!user) { router.push("/login"); return null; }

  const initials = user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 16px 80px" }}>

        {/* Back */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, color: "#6b7280", textDecoration: "none", marginBottom: 24, background: "white" }}>
          <ArrowLeft size={14} />
        </Link>

        {/* Profile header */}
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: "24px", marginBottom: 2, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            {avatarPreview ? (
              <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden" }}>
                <img src={avatarPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "white" }}>
                {initials}
              </div>
            )}
            <button onClick={() => fileInputRef.current?.click()}
              style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%", background: "var(--green)", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Camera size={11} color="white" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 2 }}>{user.name}</h2>
            <Link href="/flatmates" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none" }}>View profile</Link>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderTop: "none", display: "flex", marginBottom: 2 }}>
          {([
            { key: "basic", icon: User, label: "Basic Info" },
            { key: "notifications", icon: Bell, label: "Notifications" },
          ] as const).map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ flex: 1, padding: "12px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: tab === key ? "#111827" : "#6b7280", borderBottom: `2px solid ${tab === key ? "#111827" : "transparent"}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Icon size={14} />{label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── BASIC INFO TAB ── */}
        {tab === "basic" && (
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 12px 12px", padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 16 }}>Basic Info:</p>

            {/* Info hint */}
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8, marginBottom: 20, fontSize: 13, color: "#1e40af", lineHeight: 1.5 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>ℹ️</span>
              To maintain a healthy community of renters - the following fields are required in order to activate your account and create a listing: first name, DOB, profile picture, and email (or) phone verification.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <FieldLabel text="Full Name:" />
                <Input value={fullName} onChange={setFullName} placeholder="Your full name" />
              </div>

              <div>
                <FieldLabel text="Phone Number:" />
                <Input value={phone} onChange={setPhone} placeholder="08012345678" type="tel" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <FieldLabel text="Gender:" />
                  <div style={{ position: "relative" }}>
                    <select value={gender} onChange={e => setGender(e.target.value)}
                      style={{ width: "100%", padding: "10px 32px 10px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14, outline: "none", color: gender ? "#111827" : "#9ca3af", appearance: "none", background: "white", cursor: "pointer" }}>
                      <option value="">Select...</option>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }}>▾</span>
                  </div>
                </div>
                <div>
                  <FieldLabel text="DOB:" />
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box", background: "white" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <FieldLabel text="Work Title:" />
                  <Input value={workTitle} onChange={setWorkTitle} placeholder="e.g. student" />
                </div>
                <div>
                  <FieldLabel text="Employer:" />
                  <Input value={employer} onChange={setEmployer} placeholder="Company name" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <FieldLabel text="School Name:" />
                  <Input value={schoolName} onChange={setSchoolName} placeholder="University / College" />
                </div>
                <div>
                  <FieldLabel text="Academic Level:" />
                  <div style={{ position: "relative" }}>
                    <select value={academicLevel} onChange={e => setAcademicLevel(e.target.value)}
                      style={{ width: "100%", padding: "10px 32px 10px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 14, outline: "none", appearance: "none", background: "white", cursor: "pointer", color: academicLevel ? "#111827" : "#9ca3af" }}>
                      <option value="">Select...</option>
                      {ACADEMIC_LEVELS.filter(Boolean).map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }}>▾</span>
                  </div>
                </div>
              </div>

              <div>
                <FieldLabel text="Lifestyle:" />
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: "10px 12px", background: "white" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {lifestyle.length === 0 && (
                      <span style={{ fontSize: 14, color: "#9ca3af" }}>Add lifestyle tags</span>
                    )}
                    {lifestyle.map(t => (
                      <span key={t} onClick={() => toggleLifestyle(t)}
                        style={{ fontSize: 12, background: "var(--green-light)", color: "var(--green)", padding: "3px 10px", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}>
                        {t} ×
                      </span>
                    ))}
                  </div>
                  <div style={{ borderTop: lifestyle.length > 0 ? "1px solid #f3f4f6" : "none", marginTop: lifestyle.length > 0 ? 10 : 0, paddingTop: lifestyle.length > 0 ? 10 : 0, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {LIFESTYLE_OPTIONS.filter(t => !lifestyle.includes(t)).map(t => (
                      <span key={t} onClick={() => toggleLifestyle(t)}
                        style={{ fontSize: 12, background: "#f3f4f6", color: "#6b7280", padding: "3px 10px", borderRadius: 12, cursor: "pointer" }}>
                        + {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {error && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 12 }}>{error}</p>}
            {saved && <p style={{ color: "var(--green)", fontSize: 13, marginTop: 12, fontWeight: 600 }}>✓ Profile updated!</p>}

            <button onClick={handleSave} disabled={saving}
              style={{ width: "100%", marginTop: 20, padding: "13px", background: saving ? "#9ca3af" : "var(--green)", color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Saving..." : "Update Profile"}
            </button>
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {tab === "notifications" && (
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 12px 12px", padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 20 }}>Notification Preferences:</p>

            {[
              { label: "Email notifications", desc: "Get updates about bookings and messages via email", value: emailNotifs, set: setEmailNotifs },
              { label: "Message alerts", desc: "Get notified when someone sends you a message", value: messageNotifs, set: setMessageNotifs },
              { label: "Booking updates", desc: "Receive alerts about booking confirmations and cancellations", value: bookingNotifs, set: setBookingNotifs },
            ].map(({ label, desc, value, set }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #f3f4f6" }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>{desc}</p>
                </div>
                <button onClick={() => set(!value)}
                  style={{ width: 44, height: 24, borderRadius: 12, background: value ? "var(--green)" : "#e5e7eb", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <span style={{ position: "absolute", top: 3, left: value ? "calc(100% - 21px)" : 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </button>
              </div>
            ))}

            <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}
              style={{ width: "100%", marginTop: 24, padding: "13px", background: "var(--green)", color: "white", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              Save Preferences
            </button>
            {saved && <p style={{ color: "var(--green)", fontSize: 13, marginTop: 10, fontWeight: 600, textAlign: "center" }}>✓ Saved!</p>}
          </div>
        )}
      </div>
    </div>
  );
}
