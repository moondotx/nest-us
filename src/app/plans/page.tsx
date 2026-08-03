"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  BadgeCheck, MessageCircle, Eye, LayoutList, Zap,
  CheckCircle2, Crown, Sparkles, TrendingUp, ArrowRight
} from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Get started and explore the basics",
    color: "#6b7280",
    bgColor: "#f9fafb",
    borderColor: "#e5e7eb",
    current: true,
    benefits: [
      { icon: BadgeCheck,    label: "Basic profile",              included: true },
      { icon: MessageCircle, label: "5 messages/month",          included: true },
      { icon: LayoutList,    label: "1 active listing",           included: true },
      { icon: Eye,           label: "View access",                included: false },
      { icon: Zap,           label: "Listing boosts",             included: false },
    ],
  },
  {
    id: "basic",
    name: "Basic",
    price: 5000,
    description: "Unlock verification and send more messages",
    color: "#2563eb",
    bgColor: "#eff6ff",
    borderColor: "#bfdbfe",
    current: false,
    benefits: [
      { icon: BadgeCheck,    label: "ID Verified Badge",          included: true },
      { icon: MessageCircle, label: "Unlimited messaging",        included: true },
      { icon: LayoutList,    label: "2 active listings",          included: true },
      { icon: Eye,           label: "View access",                included: false },
      { icon: Zap,           label: "Listing boosts",             included: false },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 15000,
    description: "Full access to all premium features",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    borderColor: "#c4b5fd",
    badge: "Most Popular",
    current: false,
    benefits: [
      { icon: BadgeCheck,    label: "ID Verified Badge",          included: true },
      { icon: MessageCircle, label: "Unlimited messaging",        included: true },
      { icon: Eye,           label: "Viewed access",              included: true },
      { icon: LayoutList,    label: "5 active listings",          included: true },
      { icon: Zap,           label: "Bonus boosts included!",     included: true },
    ],
  },
];

const BOOST_OPTIONS = [
  { label: "1 Boost", price: 1500, desc: "24-hour visibility surge" },
  { label: "3 Boosts", price: 3500, desc: "Save ₦1,000", badge: "Popular" },
  { label: "10 Boosts", price: 10000, desc: "Best value — save ₦5,000", badge: "Best Value" },
];

export default function PlansPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [boostTab, setBoostTab] = useState<"spaces" | "flatmates">("spaces");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  if (!loading && !user) {
    router.push("/login");
    return null;
  }

  return (
    <div style={{ background: "var(--surface)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid var(--border)", padding: "32px 24px 28px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--dark)", marginBottom: 4 }}>My Plans & Usage</h1>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>Upgrade your plan to unlock more features and get noticed faster</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 64px", display: "flex", flexDirection: "column", gap: 36 }}>

        {/* Current plan banner */}
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--green-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Crown size={20} color="var(--green)" />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>Current Plan</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: "var(--dark)" }}>Free Plan</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)" }}>
            <span>1 listing · 5 messages/month</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--border)", display: "inline-block" }} />
            <span style={{ color: "var(--green)", fontWeight: 600 }}>Active</span>
          </div>
        </div>

        {/* ── SUBSCRIPTION PLANS ── */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--dark)", marginBottom: 4 }}>Subscriptions</h2>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>Choose a plan that works for you</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
            {PLANS.map(plan => (
              <div key={plan.id} style={{
                background: "white", borderRadius: 20, padding: 24, position: "relative",
                border: `2px solid ${selectedPlan === plan.id ? plan.color : plan.id === "premium" ? plan.borderColor : "var(--border)"}`,
                boxShadow: selectedPlan === plan.id ? `0 8px 32px ${plan.color}22` : "none",
                transition: "all 0.2s",
              }}>
                {/* Badge */}
                {plan.badge && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: plan.color, color: "white", fontSize: 11, fontWeight: 800, padding: "3px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>
                    {plan.badge}
                  </div>
                )}

                {/* Plan header */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "var(--dark)" }}>{plan.name}</span>
                    {plan.id === "premium" && <Sparkles size={15} color={plan.color} />}
                    {plan.id === "free" && plan.current && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: "var(--green-light)", color: "var(--green)", padding: "2px 8px", borderRadius: 10 }}>CURRENT</span>
                    )}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    {plan.price === 0 ? (
                      <span style={{ fontSize: 26, fontWeight: 800, color: "var(--dark)" }}>Free</span>
                    ) : (
                      <div>
                        <span style={{ fontSize: 26, fontWeight: 800, color: plan.color }}>₦{plan.price.toLocaleString()}</span>
                        <span style={{ fontSize: 13, color: "var(--muted)" }}>/month</span>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{plan.description}</p>
                </div>

                {/* Benefits */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {plan.benefits.map(({ icon: Icon, label, included }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: included ? "#dcfce7" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {included
                          ? <CheckCircle2 size={12} color="#16a34a" />
                          : <span style={{ width: 6, height: 1, background: "#d1d5db", display: "block" }} />
                        }
                      </div>
                      <span style={{ fontSize: 13, color: included ? "var(--text)" : "var(--muted)", fontWeight: included ? 500 : 400 }}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {plan.id === "free" ? (
                  <div style={{ padding: "10px", background: "var(--surface)", borderRadius: 10, textAlign: "center", fontSize: 13, fontWeight: 600, color: "var(--muted)" }}>
                    Your current plan
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    style={{
                      width: "100%", padding: "11px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer",
                      background: selectedPlan === plan.id ? plan.color : "white",
                      color: selectedPlan === plan.id ? "white" : plan.color,
                      border: `1.5px solid ${plan.color}`,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { if (selectedPlan !== plan.id) { e.currentTarget.style.background = plan.bgColor; } }}
                    onMouseLeave={e => { if (selectedPlan !== plan.id) { e.currentTarget.style.background = "white"; } }}
                  >
                    {selectedPlan === plan.id ? "✓ Selected" : `Get ${plan.name}`}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Checkout button */}
          {selectedPlan && (
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => alert(`Payment integration coming soon!\nPlan: ${selectedPlan}\nIntegrate Paystack or Flutterwave here.`)}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", background: "var(--green)", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                Proceed to payment <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ── BOOST SECTION ── */}
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "24px 24px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: "#fef3dc", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <TrendingUp size={20} color="var(--accent)" />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--dark)", marginBottom: 4 }}>Boost Your Listings</h2>
                <p style={{ fontSize: 14, color: "var(--muted)" }}>Increase visibility and get more responses by boosting your listings</p>
              </div>
            </div>

            {/* Tab switcher */}
            <div style={{ display: "flex", gap: 0 }}>
              {(["spaces", "flatmates"] as const).map(tab => (
                <button key={tab} onClick={() => setBoostTab(tab)}
                  style={{
                    padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none", background: "none",
                    borderBottom: `2px solid ${boostTab === tab ? "var(--green)" : "transparent"}`,
                    color: boostTab === tab ? "var(--green)" : "var(--muted)",
                    textTransform: "capitalize", transition: "all 0.15s",
                  }}>
                  Boost {tab === "spaces" ? "Room Listings" : "Flatmate Listings"}
                </button>
              ))}
            </div>
          </div>

          {/* Boost options */}
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Boost cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
              {BOOST_OPTIONS.map(opt => (
                <div key={opt.label} style={{ border: "1.5px solid var(--border)", borderRadius: 14, padding: "18px 16px", position: "relative", transition: "all 0.15s", cursor: "pointer" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "var(--accent)"; el.style.boxShadow = "0 4px 16px rgba(244,164,39,0.15)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "var(--border)"; el.style.boxShadow = "none"; }}>
                  {opt.badge && (
                    <span style={{ position: "absolute", top: -10, right: 12, fontSize: 10, fontWeight: 800, background: "var(--accent)", color: "white", padding: "2px 10px", borderRadius: 10 }}>
                      {opt.badge}
                    </span>
                  )}
                  <Zap size={20} color="var(--accent)" style={{ marginBottom: 10 }} />
                  <p style={{ fontSize: 15, fontWeight: 800, color: "var(--dark)", marginBottom: 2 }}>{opt.label}</p>
                  <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>{opt.desc}</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: "var(--accent)" }}>₦{opt.price.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Boost benefits */}
            <div style={{ background: "var(--surface)", borderRadius: 12, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "🚀", bold: "Bonus Boosts!", rest: " Ascend the ranks and say farewell to being lost in the depths" },
                { icon: "👁️", bold: "Enhanced Visibility", rest: " — Get more views and responses, stand out from the crowd" },
                { icon: "⏱️", bold: "24-Hour Boost", rest: " — Ultimate solution for skyrocketing visibility per credit" },
              ].map(({ icon, bold, rest }) => (
                <div key={bold} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                  <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
                    <strong>{bold}</strong>{rest}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => alert("Payment integration coming soon!\nIntegrate Paystack or Flutterwave here.")}
              style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 22px", background: "var(--accent)", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              <Zap size={15} /> Buy Boosts
            </button>
          </div>
        </div>

        {/* Payment note */}
        <div style={{ textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
          <p>Secure payments via Paystack · Cancel anytime · No hidden fees</p>
          <p style={{ marginTop: 4 }}>Questions? <a href="mailto:support@nest.ng" style={{ color: "var(--green)", fontWeight: 600 }}>Contact support</a></p>
        </div>
      </div>
    </div>
  );
}
