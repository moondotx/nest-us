"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logIn } from "@/lib/auth";
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

const TESTIMONIALS = [
  { name: "Emmanuel.", location: "Lekki", text: "Found my perfect flatmate in 2 days. The matching is incredibly accurate!", color: "#86efac" },
  { name: "Charles.", location: "Yaba", text: "Listed my spare room and had 5 inquiries within hours. Amazing platform.", color: "#93c5fd" },
  { name: "Felix.", location: "VI", text: "Safe, verified profiles gave me confidence in who I was letting into my home.", color: "#fcd34d" },
];

function LeftPanel() {
  return (
    <div style={{
      background: "linear-gradient(160deg, #0f2419 0%, #1a6b3c 60%, #0f4d2a 100%)",
      position: "relative", overflow: "hidden", display: "flex", flexDirection: "column",
      justifyContent: "space-between", padding: "48px 40px", minHeight: "100vh",
    }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")` }} />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏠</div>
        <span style={{ fontWeight: 800, fontSize: 22, color: "white", letterSpacing: "-0.5px" }}>Nest<span style={{ color: "#f4a427" }}>.</span></span>
      </div>

      {/* Testimonial cards */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, padding: "48px 0" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>What our users say</p>
        {TESTIMONIALS.map((t, i) => (
          <div key={t.name} style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 14, padding: "18px 20px",
            transform: `translateX(${i % 2 === 1 ? 16 : 0}px)`,
          }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.88)", lineHeight: 1.6, marginBottom: 12 }}>"{t.text}"</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#1a1a1a" }}>
                {t.name[0]}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{t.name}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{t.location}</p>
              </div>
              <div style={{ marginLeft: "auto" }}>
                {"⭐⭐⭐⭐⭐".split("").map((s, j) => <span key={j} style={{ fontSize: 11 }}>{s}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "white", lineHeight: 1.2, marginBottom: 8, letterSpacing: "-0.5px" }}>
          Nigeria's trusted<br />
          <span style={{ color: "#f4a427" }}>space booking</span> platform
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
          2,500+ verified users · Lagos and beyond
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await logIn(email, password);
      await refresh();
      router.push("/");
    } catch (err: any) {
      setError(err.message ?? "Invalid email or password");
    } finally { setLoading(false); }
  };

  const handleGoogle = () => {
    setGoogleLoading(true);
    account.createOAuth2Session("google" as any, `${window.location.origin}/oauth`, `${window.location.origin}/login`);
  };

  const inp = {
    width: "100%", padding: "11px 14px", border: "1px solid #e5e7eb",
    borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" as const,
    background: "white", color: "#111827",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }} className="auth-split">
      <div className="hidden md:block"><LeftPanel /></div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 36px", background: "#f9fafb" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", textDecoration: "none", marginBottom: 32 }}>
            <ArrowLeft size={14} /> Back
          </Link>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>Sign in to your Nest account</p>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading}
            style={{ ...inp, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontWeight: 600, cursor: "pointer", marginBottom: 20, border: "1.5px solid #e5e7eb", padding: "12px 14px" }}>
            <GoogleIcon /> {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: "#374151", display: "block", marginBottom: 5, fontWeight: 500 }}>Email address</label>
              <input type="email" style={inp} placeholder="example@mail.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <label style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Password</label>
                <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 600, cursor: "pointer" }}>Forgot password?</span>
              </div>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} style={{ ...inp, paddingRight: 40 }} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 13, borderRadius: 8, padding: "10px 14px" }}>{error}</div>
            )}

            <button type="submit" disabled={loading}
              style={{ padding: "13px", border: "none", borderRadius: 10, background: loading ? "#9ca3af" : "var(--green)", color: "white", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280" }}>
              Don't have an account?{" "}
              <Link href="/signup" style={{ color: "var(--green)", fontWeight: 600, textDecoration: "none" }}>Sign up free</Link>
            </p>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .auth-split { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
