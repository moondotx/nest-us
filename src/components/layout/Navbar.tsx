"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Home, User, MessageCircle, PlusCircle, LayoutList, BadgeCheck, TrendingUp, Info, FileText, Shield, Rss, LogOut, Zap } from "lucide-react";

const MENU_ITEMS = [
  { icon: User,         label: "My Profile & Settings", href: "/profile" },
  { icon: MessageCircle,label: "Messages",              href: "/messages" },
  { icon: PlusCircle,   label: "Create Listing",        href: "/create" },
  { icon: LayoutList,   label: "My Listings",           href: "/dashboard" },
  { icon: BadgeCheck,   label: "Verifications & Badges",href: "/dashboard" },
  { icon: TrendingUp,   label: "My Plans",              href: "/plans" },
  null, // divider
  { icon: Info,         label: "About",                 href: "/" },
  { icon: Shield,       label: "Privacy Policy",        href: "/" },
  { icon: FileText,     label: "Terms of Service",      href: "/" },
  { icon: Rss,          label: "Blog",                  href: "/" },
];

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push("/");
    setMobileOpen(false);
  };

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "";

  const navLink = (href: string, label: string) => ({
    href, label,
    active: href === "/" ? pathname === "/" : pathname.startsWith(href),
  });

  const publicLinks = [
    navLink("/", "Spaces"),
    navLink("/flatmates", "Flatmates"),
    navLink("/create", "List a space"),
  ];
  const authLinks = user ? [navLink("/dashboard", "Dashboard"), navLink("/bookings", "Bookings")] : [];
  const allLinks = [...publicLinks, ...authLinks];

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "white", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Home size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: "var(--dark)", letterSpacing: "-0.5px" }}>
            Nest<span style={{ color: "var(--green)" }}>.</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }} className="hidden md:flex">
          {allLinks.map(({ href, label, active }) => {
            const isFlatmates = href === "/flatmates";
            return (
              <Link key={href} href={href} style={{
                padding: "7px 13px", borderRadius: 8, fontSize: 14,
                fontWeight: isFlatmates ? 600 : 500,
                color: active ? "var(--green)" : isFlatmates ? "var(--dark)" : "var(--muted)",
                background: active ? "var(--green-light)" : "transparent",
                textDecoration: "none", display: "flex", alignItems: "center", gap: 5,
                border: isFlatmates && !active ? "1px solid var(--border)" : "1px solid transparent",
                transition: "all 0.15s",
              }}>
                {isFlatmates && <span style={{ fontSize: 14 }}>👥</span>}
                {label}
                {isFlatmates && (
                  <span style={{ fontSize: 9, fontWeight: 800, background: "var(--accent)", color: "white", padding: "1px 5px", borderRadius: 8, lineHeight: 1.7, letterSpacing: "0.3px" }}>NEW</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Auth area */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="hidden md:flex">
          {!loading && (user ? (
            /* ── Avatar + dropdown ── */
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 5px 5px", borderRadius: 24, border: "1.5px solid var(--border)", background: "white", cursor: "pointer", transition: "border-color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--green)")}
                onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.borderColor = "var(--border)"; }}
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--green)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>
                  {initials}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--dark)" }}>{user.name.split(" ")[0]}</span>
                <Menu size={14} color="var(--muted)" />
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  background: "white", border: "1px solid var(--border)", borderRadius: 16,
                  boxShadow: "0 8px 40px rgba(0,0,0,0.12)", minWidth: 260, zIndex: 200,
                  overflow: "hidden", padding: "8px 0",
                }}>
                  {/* User header */}
                  <div style={{ padding: "12px 18px 12px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--green)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800 }}>
                        {initials}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--dark)", lineHeight: 1.2 }}>{user.name}</p>
                        <p style={{ fontSize: 12, color: "var(--muted)" }}>{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  {MENU_ITEMS.map((item, i) =>
                    item === null ? (
                      <div key={i} style={{ height: 1, background: "var(--border)", margin: "6px 0" }} />
                    ) : (
                      <Link key={item.href + item.label} href={item.href} onClick={() => setMenuOpen(false)}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", fontSize: 14, color: "var(--text)", textDecoration: "none", transition: "background 0.1s" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <item.icon size={17} color="var(--muted)" strokeWidth={1.8} />
                        {item.label}
                      </Link>
                    )
                  )}

                  {/* Logout */}
                  <div style={{ height: 1, background: "var(--border)", margin: "6px 0" }} />
                  <button onClick={handleLogout}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", fontSize: 14, color: "#dc2626", background: "none", border: "none", width: "100%", cursor: "pointer", transition: "background 0.1s", textAlign: "left" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <LogOut size={17} color="#dc2626" strokeWidth={1.8} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" style={{ padding: "8px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "var(--green)", textDecoration: "none", border: "1.5px solid var(--green)", background: "white" }}>Log in</Link>
              <Link href="/signup" className="btn-primary" style={{ padding: "8px 16px", borderRadius: 10, fontSize: 14, textDecoration: "none" }}>Sign up free</Link>
            </>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }} className="md:hidden">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ borderTop: "1px solid var(--border)", background: "white", padding: "16px 24px 20px" }} className="md:hidden">
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {allLinks.map(({ href, label, active }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} style={{
                padding: "10px 12px", borderRadius: 8, fontSize: 14, fontWeight: 500,
                color: active ? "var(--green)" : "var(--text)",
                background: active ? "var(--green-light)" : "transparent",
                textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
              }}>
                {href === "/flatmates" && <span>👥</span>}
                {label}
                {href === "/flatmates" && (
                  <span style={{ fontSize: 9, fontWeight: 800, background: "var(--accent)", color: "white", padding: "1px 5px", borderRadius: 8, lineHeight: 1.7 }}>NEW</span>
                )}
              </Link>
            ))}
            <div style={{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {user ? (
                <>
                  {MENU_ITEMS.filter(Boolean).map((item: any) => (
                    <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, fontSize: 14, color: "var(--text)", textDecoration: "none" }}>
                      <item.icon size={15} color="var(--muted)" />
                      {item.label}
                    </Link>
                  ))}
                  <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, fontSize: 14, color: "#dc2626", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                    <LogOut size={15} color="#dc2626" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} style={{ padding: "10px 12px", borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: "center", color: "var(--green)", border: "1.5px solid var(--green)", textDecoration: "none" }}>Log in</Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ borderRadius: 10, textDecoration: "none" }}>Sign up free</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
