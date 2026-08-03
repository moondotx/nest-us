"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getMyBookings, cancelBooking, BookingDoc } from "@/lib/bookings";
import { CalendarDays, MapPin, Clock, XCircle } from "lucide-react";

const statusStyles: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-stone-50 text-stone-400 border-stone-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
};

export default function BookingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<BookingDoc[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    getMyBookings(user.$id)
      .then(setBookings)
      .finally(() => setFetching(false));
  }, [user, loading]);

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    await cancelBooking(id);
    setBookings((prev) => prev.map((b) => b.$id === id ? { ...b, status: "cancelled" } : b));
  };

  if (loading || fetching) return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="h-8 bg-stone-100 rounded w-48 mb-8 animate-pulse" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card p-5 mb-4 animate-pulse">
          <div className="h-5 bg-stone-100 rounded w-2/3 mb-3" />
          <div className="h-4 bg-stone-100 rounded w-1/3" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl text-stone-900 mb-2">My bookings</h1>
      <p className="text-stone-500 text-sm mb-8">{bookings.length} total</p>

      {bookings.length === 0 ? (
        <div className="text-center py-20 card border border-stone-100">
          <CalendarDays className="w-10 h-10 text-stone-200 mx-auto mb-3" />
          <p className="text-stone-500 mb-4">No bookings yet</p>
          <button onClick={() => router.push("/")} className="btn-primary">Browse spaces</button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.$id} className="card border border-stone-100 p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-medium text-stone-900 text-base mb-0.5">{b.spaceName}</h3>
                  <span className={`badge border text-xs ${statusStyles[b.status]}`}>
                    {b.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-stone-900">${b.totalPrice.toFixed(0)}</p>
                  <p className="text-xs text-stone-400">{b.hours.toFixed(1)} hrs</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-stone-500 mb-3">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {b.date}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {b.startTime} – {b.endTime}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {b.spaceLocation}
                </div>
              </div>

              {b.status === "confirmed" && (
                <button
                  onClick={() => handleCancel(b.$id)}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition mt-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Cancel booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
