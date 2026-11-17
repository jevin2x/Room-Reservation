
import { useEffect, useState } from "react";
import { NavLink } from "react-router";

import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { ApiError, reservationApi } from "@/lib/api";
import type { Reservation } from "@/types";

function formatDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function hasEnded(reservation: Reservation): boolean {
  const end = new Date(
    `${reservation.reservation_date}T${reservation.end_time}:00`,
  );
  return !Number.isNaN(end.getTime()) && end <= new Date();
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    reservationApi
      .list({})
      .then((data) => {
        if (!cancelled) setReservations(data);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load reservations.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCancel(reservation: Reservation) {
    setCancellingId(reservation.id);
    setError(null);

    try {
      const updated = await reservationApi.cancel(reservation.id);

      setReservations((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to cancel the reservation.");
      }
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#071426]">
                Reservations
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                View and manage room reservations.
              </p>
            </div>

            <NavLink to="/reservations/create">
              <Button className="bg-[#071426] hover:bg-[#0d1d35]">
                Reserve a Room
              </Button>
            </NavLink>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="font-semibold text-[#071426]">
                    Reservation Records
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {loading
                      ? "Loading..."
                      : `${reservations.length} reservation(s) in the system`}
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-slate-500">
                  Loading reservations...
                </p>
              </div>
            ) : reservations.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-slate-500">
                  No reservations found.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                        Reference
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                        Section
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                        Facility
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                        Date
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                        Time
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                        Purpose
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                        Status
                      </th>

                      <th className="text-right px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {reservations.map((reservation) => {
                      const canCancel =
                        !hasEnded(reservation) &&
                        (reservation.status === "pending" ||
                          reservation.status === "approved");

                      return (
                        <tr
                          key={reservation.id}
                          className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-[#071426]">
                            {reservation.code}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {reservation.section?.label ?? "—"}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {reservation.room?.name ?? "—"}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                            {formatDate(reservation.reservation_date)}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                            {reservation.start_time} – {reservation.end_time}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {reservation.purpose}
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex text-xs font-medium px-3 py-1 rounded-full capitalize bg-slate-100 text-slate-600">
                              {reservation.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            {canCancel ? (
                              <Button
                                variant="danger"
                                disabled={cancellingId === reservation.id}
                                onClick={() =>
                                  void handleCancel(reservation)
                                }
                              >
                                {cancellingId === reservation.id
                                  ? "Cancelling..."
                                  : "Cancel"}
                              </Button>
                            ) : (
                              <span className="text-xs text-slate-400">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
