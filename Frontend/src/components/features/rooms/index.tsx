
import { useEffect, useState } from "react";
import { NavLink } from "react-router";

import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { roomApi } from "@/lib/api";
import type { Room } from "@/types";

const availabilityLabel: Record<Room["availability"], string> = {
  available: "Available",
  reserved: "Reserved",
  maintenance: "Maintenance",
};

const availabilityStyles: Record<Room["availability"], string> = {
  available: "text-emerald-700 bg-emerald-50",
  reserved: "text-red-700 bg-red-50",
  maintenance: "text-amber-700 bg-amber-50",
};

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = Number(hours);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;

  return minutes === "00"
    ? `${display} ${suffix}`
    : `${display}:${minutes} ${suffix}`;
}

function hasPassedToday(endTime: string): boolean {
  if (!endTime) return true;

  const parts = endTime.split(":");
  const hours = Number(parts[0]);
  const minutes = Number(parts[1] ?? 0);

  const now = Date.now();
  const end = new Date();
  end.setHours(hours, minutes, 0, 0);

  return now >= end.getTime();
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 10_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    function load() {
      roomApi
        .list()
        .then((data) => {
          if (!cancelled) setRooms(data);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    load();

    const interval = window.setInterval(load, 30_000);

    const onFocus = () => {
      if (document.visibilityState === "visible") load();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#071426]">Rooms</h1>

              <p className="text-sm text-slate-500 mt-1">
                View facilities and their reservations for today at Cordova
                Public College.
              </p>
            </div>

            <NavLink to="/reservations/create">
              <Button className="bg-[#071426] hover:bg-[#0d1d35] whitespace-nowrap">
                Reserve a Room
              </Button>
            </NavLink>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200">
              <h2 className="font-semibold text-[#071426]">
                School Facilities
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                {loading ? "Loading..." : `${rooms.length} facilities in the system`}
              </p>
            </div>

            {loading ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-slate-500">Loading rooms...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-sm text-slate-500">No facilities found.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {rooms.map((room, index) => {
                  const schedule = room.today_schedule ?? [];

                  const upcomingSlots =
                    room.status === "maintenance"
                      ? []
                      : schedule.filter((slot) => !hasPassedToday(slot.end_time));

                  const displayAvailability =
                    room.status === "maintenance"
                      ? "maintenance"
                      : upcomingSlots.length > 0
                        ? "reserved"
                        : "available";

                  return (
                  <div
                    key={room.id}
                    className="p-5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-5 flex-wrap sm:flex-nowrap">
                      <div className="w-24 h-16 shrink-0 overflow-hidden rounded-md bg-slate-200">
                        <img
                          src={room.image ?? "/Rooms.jpeg"}
                          alt={room.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="w-8 text-sm text-slate-400">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#071426]">
                          {room.name}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {room.description ?? "Cordova Public College facility"}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          Capacity {room.capacity}
                          {room.building ? ` · ${room.building.name}` : ""}
                          {room.code ? ` · ${room.code}` : ""}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "text-xs font-medium px-3 py-1 rounded-full",
                          availabilityStyles[displayAvailability],
                        )}
                      >
                        {availabilityLabel[displayAvailability]}
                      </span>
                    </div>

                    <div className="mt-4 ml-[8.5rem]">
                      {displayAvailability === "maintenance" ? (
                        <p className="text-xs text-amber-600">
                          Under maintenance — not available for reservations.
                        </p>
                      ) : upcomingSlots.length === 0 ? (
                        <p className="text-xs text-emerald-600">
                          No reservations today. Room is available.
                        </p>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-2">
                            Reservation Mapping
                          </p>

                          <div className="space-y-1.5">
                            {upcomingSlots.map((slot, slotIndex) => (
                              <div
                                key={slotIndex}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span className="font-medium text-red-700 bg-red-50 px-2 py-1 rounded">
                                  {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                                </span>

                                <span className="text-slate-600">
                                  Reserved · {slot.purpose || "Room reservation"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
