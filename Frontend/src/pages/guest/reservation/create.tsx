import { useEffect, useMemo, useState, type FormEvent } from "react";
import { NavLink, useSearchParams } from "react-router";

import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ApiError, reservationApi, roomApi } from "@/lib/api";
import type { Room } from "@/types";

export default function ReservationCreatePage() {
  const [searchParams] = useSearchParams();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);

  const [roomId, setRoomId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<boolean | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ code: string } | null>(null);

  const initialRoomName = useMemo(
    () => searchParams.get("room") ?? "",
    [searchParams],
  );

  useEffect(() => {
    let cancelled = false;

    roomApi
      .list()
      .then((roomData) => {
        if (cancelled) return;

        const availableRooms = roomData.filter(
          (room) => room.status === "available",
        );

        setRooms(availableRooms);

        const preset = initialRoomName
          ? availableRooms.find(
              (room) =>
                room.name.toLowerCase() === initialRoomName.toLowerCase() ||
                room.code?.toLowerCase() === initialRoomName.toLowerCase(),
            )
          : undefined;

        if (preset) {
          setRoomId(String(preset.id));
        }
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load reservation data.");
      })
      .finally(() => {
        if (!cancelled) setRoomsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialRoomName]);

  function clearAvailability() {
    setAvailability(null);
    setConflictError(null);
  }

  async function handleCheckAvailability() {
    setChecking(true);
    setAvailability(null);
    setConflictError(null);

    try {
      const result = await roomApi.availability(
        Number(roomId),
        date,
        startTime,
        endTime,
      );
      setAvailability(result.available);
    } catch (err) {
      if (err instanceof ApiError) {
        const firstError = err.errors
          ? Object.values(err.errors)[0]?.[0]
          : null;
        setConflictError(firstError ?? err.message);
      }
    } finally {
      setChecking(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setConflictError(null);
    setSubmitting(true);

    try {
      const reservation = await reservationApi.create({
        room_id: roomId,
        reservation_date: date,
        start_time: startTime,
        end_time: endTime,
        purpose,
        notes: notes || null,
      });

      setSuccess({ code: reservation.code });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422) {
          const firstError = err.errors
            ? Object.entries(err.errors)[0]
            : null;
          if (firstError) {
            setConflictError(
              `${firstError[0].replaceAll("_", " ")}: ${firstError[1][0]}`,
            );
          } else {
            setConflictError(err.message);
          }
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Header />

        <main className="flex-1">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                <span className="text-2xl">✓</span>
              </div>

              <h2 className="text-xl font-bold text-[#071426]">
                Reservation Confirmed
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                Your reservation has been confirmed. The room is now booked
                for your selected time slot.
              </p>

              <p className="mt-4 inline-block bg-slate-100 rounded-lg px-4 py-2 text-sm font-medium text-[#071426]">
                Reference: {success.code}
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <NavLink to="/rooms">
                  <Button className="bg-[#071426] hover:bg-[#0d1d35]">
                    View Rooms
                  </Button>
                </NavLink>

                <NavLink to="/dashboard">
                  <Button variant="secondary">Go to Dashboard</Button>
                </NavLink>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#071426]">
              Reserve a Room
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Fill in the details below to reserve a facility. The reservation
              is automatically approved and booked for your section.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-lg p-6 space-y-5"
          >
            <div>
              <label
                htmlFor="room"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Facility
              </label>

              {roomsLoading ? (
                <p className="text-sm text-slate-400">Loading rooms...</p>
              ) : (
                <select
                  id="room"
                  required
                  value={roomId}
                  onChange={(event) => {
                    setRoomId(event.target.value);
                    clearAvailability();
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#071426]/30"
                >
                  <option value="">Select a facility</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                      {room.code ? ` (${room.code})` : ""} — capacity{" "}
                      {room.capacity}
                      {room.todays_reservations_count > 0
                        ? " (Reserved today)"
                        : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Date
                </label>

                <input
                  id="date"
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value);
                    clearAvailability();
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#071426]/30"
                />
              </div>

              <div>
                <label
                  htmlFor="start-time"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Start Time
                </label>

                <input
                  id="start-time"
                  type="time"
                  required
                  value={startTime}
                  onChange={(event) => {
                    setStartTime(event.target.value);
                    clearAvailability();
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#071426]/30"
                />
              </div>

              <div>
                <label
                  htmlFor="end-time"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  End Time
                </label>

                <input
                  id="end-time"
                  type="time"
                  required
                  value={endTime}
                  onChange={(event) => {
                    setEndTime(event.target.value);
                    clearAvailability();
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#071426]/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={checking || !roomId || !date || !startTime || !endTime}
                onClick={handleCheckAvailability}
              >
                {checking ? "Checking..." : "Check availability"}
              </Button>

              {availability !== null && (
                <span
                  className={cn(
                    "text-xs font-medium px-3 py-1 rounded-full",
                    availability
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-red-700 bg-red-50",
                  )}
                >
                  {availability
                    ? "Available on this date and time"
                    : "Already reserved"}
                </span>
              )}

              {conflictError && (
                <span className="text-xs text-red-600">{conflictError}</span>
              )}
            </div>

            <div>
              <label
                htmlFor="purpose"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Purpose
              </label>

              <input
                id="purpose"
                type="text"
                required
                maxLength={255}
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                placeholder="e.g. Class Activity, Seminar, Student Meeting"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#071426]/30"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Notes (optional)
              </label>

              <textarea
                id="notes"
                rows={3}
                maxLength={2000}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#071426]/30 resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={
                submitting ||
                !roomId ||
                !date ||
                !startTime ||
                !endTime ||
                !purpose
              }
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit reservation"}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}