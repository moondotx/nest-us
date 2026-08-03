"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getMySpaces, deleteSpace, SpaceDoc } from "@/lib/spaces";
import { getHostBookings, BookingDoc } from "@/lib/bookings";
import { Plus, Trash2, Building2, CalendarDays, DollarSign, Star } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [spaces, setSpaces] = useState<SpaceDoc[]>([]);
  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState<"listings" | "bookings">("listings");

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    Promise.all([getMySpaces(user.$id), getHostBookings(user.$id)])
      .then(([s, b]) => { setSpaces(s); setBookings(b); })
      .finally(() => setFetching(false));
  }, [user, loading]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing? This cannot be undone.")) return;
    await deleteSpace(id);
    setSpaces((prev) => prev.filter((s) => s.$id !== id));
  };

  const totalEarnings = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;

  if (loading || fetching) return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 bg-stone-100 rounded w-48 mb-6" />
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-stone-100 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl text-stone-900">Dashboard</h1>
          <p className="text-stone-400 text-sm mt-1">Welcome back, {user?.name?.split(" ")[0]}</p>
        </div>
        <Link href="/list-space" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Building2, label: "Listings", value: spaces.length, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: CalendarDays, label: "Bookings", value: confirmedBookings, color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: DollarSign, label: "Earnings", value: `$${totalEarnings.toFixed(0)}`, color: "text-amber-600", bg: "bg-amber-50" },
          { icon: Star, label: "Avg rating", value: spaces.length ? (spaces.reduce((s, sp) => s + sp.rating, 0) / spaces.length).toFixed(1) : "—", color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="card border border-stone-100 p-5">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4.5 h-4.5 ${color}`} style={{ width: 18, height: 18 }} />
            </div>
            <p className="text-2xl font-semibold text-stone-900">{value}</p>
            <p className="text-xs text-stone-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-xl w-fit">
        {(["listings", "bookings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition capitalize ${
              tab === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Listings tab */}
      {tab === "listings" && (
        <div>
          {spaces.length === 0 ? (
            <div className="text-center py-16 card border border-stone-100">
              <Building2 className="w-10 h-10 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-500 mb-4">You have no listings yet</p>
              <Link href="/list-space" className="btn-primary">List your first space</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {spaces.map((s) => (
                <div key={s.$id} className="card border border-stone-100 p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center text-xl flex-shrink-0">
                    {s.type === "office" ? "🏢" : s.type === "apartment" ? "🏠" : s.type === "hostel" ? "🛏️" : "🏨"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/spaces/${s.$id}`} className="font-medium text-stone-900 hover:underline block truncate">{s.title}</Link>
                    <p className="text-sm text-stone-400 truncate">{s.location}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="font-medium text-stone-900">${s.price}/hr</p>
                      <p className="text-xs text-stone-400">Capacity {s.capacity}</p>
                    </div>
                    <span className={`badge border hidden sm:inline-flex ${
                      s.type === "office" ? "bg-blue-50 text-blue-700 border-blue-100" : s.type === "apartment" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : s.type === "hostel" ? "bg-orange-50 text-orange-700 border-orange-100" : "bg-purple-50 text-purple-700 border-purple-100"
                    }`}>{s.type}</span>
                    <button
                      onClick={() => handleDelete(s.$id)}
                      className="p-2 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookings tab */}
      {tab === "bookings" && (
        <div>
          {bookings.length === 0 ? (
            <div className="text-center py-16 card border border-stone-100">
              <CalendarDays className="w-10 h-10 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-500">No bookings for your spaces yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.$id} className="card border border-stone-100 p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 truncate">{b.spaceName}</p>
                    <p className="text-sm text-stone-400">{b.userName} · {b.date} · {b.startTime}–{b.endTime}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`badge border text-xs ${
                      b.status === "confirmed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                      b.status === "cancelled" ? "bg-stone-50 text-stone-400 border-stone-100" :
                      "bg-amber-50 text-amber-700 border-amber-100"
                    }`}>{b.status}</span>
                    <p className="font-semibold text-stone-900">${b.totalPrice.toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
