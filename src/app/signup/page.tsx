"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth";
import { account } from "@/lib/appwrite";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.2 7.3-10.5 7.3-17.5z" fill="#4285F4"/>
      <path d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.6v6.1C6.6 42.6 14.8 48 24 48z" fill="#34A853"/>
      <path d="M10.8 28.8c-.5-1.4-.7-2.8-.7-4.3s.3-3 .7-4.3v-6.1H2.6C.9 17.4 0 20.6 0 24s.9 6.6 2.6 9.9l8.2-5.1z" fill="#FBBC05"/>
      <path d="M24 9.6c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C35.9 2.6 30.5 0 24 0 14.8 0 6.6 5.4 2.6 14.1l8.2 6.1C12.7 13.7 17.9 9.6 24 9.6z" fill="#EA4335"/>
    </svg>
  );
}

const LIFESTYLE_OPTIONS = ["quiet", "clean", "social", "early riser", "night owl", "non-smoker", "pet-friendly", "student", "working professional"];

const PROFILES = [
  { name: "Emmanuel Ofuokwu", role: "Software Engineer", color: "#86efac", initial: "A" },
  { name: "Ayodele Chukwuemeka", role: "Medical Doctor", color: "#93c5fd", initial: "T" },
  { name: "Aroleye Janet", role: "Content Creator", color: "#f9a8d4", initial: "C" },
];

function HeroPanel() {
  return (
    <div style={{
      flex: "0 0 48%", background: "var(--green)", position: "relative",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "48px 44px", overflow: "hidden", minHeight: "100vh",
    }}>
      {/* Hexagon pattern overlay */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.07, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50V16L28 0l28 16v34L28 66zm0-86L6 9v28l22 13 22-13V9L28-20z' fill='%23fff'/%3E%3C/svg%3E")`, backgroundSize: "56px 100px" }} />

      {/* Logo */}
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏠</div>
          <span style={{ fontWeight: 800, fontSize: 22, color: "white", letterSpacing: "-0.5px" }}>Nest.</span>
        </div>
      </div>

      {/* Floating profile cards */}
      <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 280, height: 260 }}>
          {PROFILES.map((p, i) => (
            <div key={p.name} style={{
              position: "absolute",
              top: `${i * 72}px`,
              left: `${i * 16}px`,
              right: `${-i * 16}px`,
              background: "white",
              borderRadius: 16,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              zIndex: 3 - i,
              opacity: i === 0 ? 1 : i === 1 ? 0.92 : 0.82,
              transform: `rotate(${i === 0 ? -1 : i === 1 ? 1 : 2}deg)`,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#1a1a1a", flexShrink: 0 }}>
                {p.initial}
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: 0 }}>{p.name}</p>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>{p.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <div style={{ position: "relative" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: "white", lineHeight: 1.2, marginBottom: 8 }}>
          Find your <span style={{ background: "#f4a427", color: "#111", padding: "2px 10px", borderRadius: 6, fontSize: 30 }}>match</span><br />
          Find your space.
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, marginBottom: 20 }}>
          Seamless Room Listing<br />
          Whether you're searching for a flatmate or listing a room, we make the process seamless and stress-free.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: i === 0 ? 24 : 8, height: 8, borderRadius: 4, background: i === 0 ? "#f4a427" : "rgba(255,255,255,0.35)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [workTitle, setWorkTitle] = useState("");
  const [employer, setEmployer] = useState("");
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [userType, setUserType] = useState<"professional" | "student" | "">("");
  const [referral, setReferral] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleLifestyle = (t: string) =>
    setLifestyle(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setError(""); setLoading(true);
    try {
      await signUp(name, email, password);
      await refresh();
      router.push("/");
    } catch (err: any) {
      setError(err.message ?? "Could not create account");
    } finally { setLoading(false); }
  };

  const handleGoogle = () => {
    setGoogleLoading(true);
    account.createOAuth2Session("google" as any, `${window.location.origin}/oauth`, `${window.location.origin}/signup`);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 13px", border: "1px solid #e5e7eb",
    borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box",
    background: "white", color: "#111827", fontFamily: "inherit",
  };

  const Label = ({ text }: { text: string }) => (
    <label style={{ fontSize: 13, color: "#374151", fontWeight: 500, display: "block", marginBottom: 5 }}>{text}</label>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Left hero - hidden on mobile */}
      <div className="hidden lg:flex" style={{ flex: "0 0 46%" }}>
        <HeroPanel />
      </div>

      {/* Right form */}
      <div style={{ flex: 1, overflowY: "auto", background: "#f9fafb" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 28px 64px" }}>

          {/* Back + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <Link href="/" style={{ display: "inline-flex", padding: 6, border: "1px solid #e5e7eb", borderRadius: 8, background: "white", textDecoration: "none", color: "#6b7280" }}>
              <ArrowLeft size={16} />
            </Link>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>Sign Up</h1>
          </div>

          {/* Info box */}
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", display: "flex", gap: 8, marginBottom: 20, fontSize: 13, color: "#1e40af", lineHeight: 1.5 }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>ℹ️</span>
            To maintain a healthy community of renters - the following fields are required in order to activate your account and create a listing: first name, DOB, profile picture, and email.
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading}
            style={{ width: "100%", padding: "11px 16px", border: "1.5px solid #e5e7eb", borderRadius: 10, background: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer", marginBottom: 16 }}>
            <GoogleIcon />{googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            <span style={{ fontSize: 12, color: "#9ca3af" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><Label text="Full Name:" /><input style={inputStyle} placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required /></div>
            <div><Label text="Email:" /><input type="email" style={inputStyle} placeholder="youremail@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div><Label text="Phone Number:" /><input type="tel" style={inputStyle} placeholder="+234 801 234 5678" value={phone} onChange={e => setPhone(e.target.value)} /></div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label text="Password:" />
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} style={{ ...inputStyle, paddingRight: 38 }} placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <Label text="Confirm Password:" />
                <div style={{ position: "relative" }}>
                  <input type={showConfirm ? "text" : "password"} style={{ ...inputStyle, paddingRight: 38 }} placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label text="Gender:" />
                <select value={gender} onChange={e => setGender(e.target.value)} style={{ ...inputStyle, appearance: "none", cursor: "pointer", color: gender ? "#111827" : "#9ca3af" }}>
                  <option value="">Select gender</option>
                  <option>male</option><option>female</option><option>non-binary</option><option>prefer not to say</option>
                </select>
              </div>
              <div>
                <Label text="Date of Birth:" />
                <input type="date" style={inputStyle} value={dob} onChange={e => setDob(e.target.value)} />
              </div>
            </div>

            {/* User type */}
            <div>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#166534" }}>
                <span>💡</span><span><strong>Help us match you better!</strong></span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { key: "professional", icon: "💼", label: "Working Professional" },
                  { key: "student", icon: "🎓", label: "Student" },
                ] .map(({ key, icon, label }) => (
                  <button key={key} type="button" onClick={() => setUserType(key as any)}
                    style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${userType === key ? "var(--green)" : "#e5e7eb"}`, background: userType === key ? "var(--green-light)" : "white", color: userType === key ? "var(--green)" : "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <span>{icon}</span>{label}
                  </button>
                ))}
              </div>
            </div>

            <div><Label text="Work Title: *" /><input style={inputStyle} placeholder="Required - your work/occupation" value={workTitle} onChange={e => setWorkTitle(e.target.value)} /></div>
            <div><Label text="Employer:" /><input style={inputStyle} placeholder="e.g., Google, NYSC, Self-employed" value={employer} onChange={e => setEmployer(e.target.value)} /></div>

            {/* Lifestyle */}
            <div>
              <Label text="Lifestyle:" />
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", background: "white", cursor: "text" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: lifestyle.length > 0 ? 8 : 0 }}>
                  {lifestyle.map(t => (
                    <span key={t} onClick={() => toggleLifestyle(t)} style={{ fontSize: 12, background: "var(--green-light)", color: "var(--green)", padding: "3px 10px", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}>{t} ×</span>
                  ))}
                  {lifestyle.length === 0 && <span style={{ fontSize: 14, color: "#9ca3af" }}>Add lifestyle tags</span>}
                </div>
                {LIFESTYLE_OPTIONS.filter(t => !lifestyle.includes(t)).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, borderTop: lifestyle.length > 0 ? "1px solid #f3f4f6" : "none", paddingTop: lifestyle.length > 0 ? 8 : 0 }}>
                    {LIFESTYLE_OPTIONS.filter(t => !lifestyle.includes(t)).map(t => (
                      <span key={t} onClick={() => toggleLifestyle(t)} style={{ fontSize: 12, background: "#f3f4f6", color: "#6b7280", padding: "3px 10px", borderRadius: 12, cursor: "pointer" }}>+ {t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div><Label text="Referral Code (Optional): " /><input style={inputStyle} placeholder="MOQ8X2FR" value={referral} onChange={e => setReferral(e.target.value)} /></div>

            {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 13, borderRadius: 8, padding: "10px 14px" }}>{error}</div>}

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "13px", border: "none", borderRadius: 10, background: loading ? "#9ca3af" : "var(--green)", color: "white", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "var(--green)", fontWeight: 600, textDecoration: "none" }}>Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
