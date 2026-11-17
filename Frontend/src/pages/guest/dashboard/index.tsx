
import { useEffect, useState } from "react";
import { NavLink } from "react-router";

import { Footer } from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { roomApi } from "@/lib/api";
import type { Room } from "@/types";

function hasPassedToday(endTime: string): boolean {
  if (!endTime) return true;

  const [hours, minutes] = endTime.split(":").map(Number);
  const now = new Date();
  const end = new Date();
  end.setHours(hours, minutes, 0, 0);
  return now >= end;
}

function availabilityOf(room: Room): Room["availability"] {
  if (room.status === "maintenance") return "maintenance";

  const hasUpcoming = (room.today_schedule ?? []).some(
    (slot) => !hasPassedToday(slot.end_time),
  );

  return hasUpcoming ? "reserved" : "available";
}

export default function DashboardPage() {
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

  const totalRooms = rooms.length;
  const availableToday = rooms.filter(
    (room) => availabilityOf(room) === "available",
  ).length;
  const reservedToday = rooms.filter(
    (room) => availabilityOf(room) === "reserved",
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#071426]">
              Dashboard
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Cordova Public College Room Reservation System
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <p className="text-sm text-slate-500">
                Total Rooms
              </p>

              <p className="text-3xl font-bold text-[#071426] mt-2">
                {loading ? "—" : totalRooms}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Registered facilities
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <p className="text-sm text-slate-500">
                Available Today
              </p>

              <p className="text-3xl font-bold text-emerald-600 mt-2">
                {loading ? "—" : availableToday}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Rooms with no reservation today
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <p className="text-sm text-slate-500">
                Reserved Today
              </p>

              <p className="text-3xl font-bold text-red-600 mt-2">
                {loading ? "—" : reservedToday}
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Rooms with a booking today
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg">
              <div className="px-6 py-5 border-b border-slate-200">
                <h2 className="font-semibold text-[#071426]">
                  Quick Actions
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Common room reservation activities
                </p>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NavLink to="/reservations/create">
                  <Button className="w-full bg-[#071426] hover:bg-[#0d1d35]">
                    Reserve a Room
                  </Button>
                </NavLink>

                <NavLink to="/rooms">
                  <Button variant="secondary" className="w-full">
                    View Rooms
                  </Button>
                </NavLink>

                <NavLink to="/reservations">
                  <Button variant="secondary" className="w-full">
                    View Reservations
                  </Button>
                </NavLink>

                <NavLink to="/about">
                  <Button variant="secondary" className="w-full">
                    System Information
                  </Button>
                </NavLink>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg">
              <div className="px-6 py-5 border-b border-slate-200">
                <h2 className="font-semibold text-[#071426]">
                  System Status
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Current system information
                </p>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Room Management
                  </span>

                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    Reservations
                  </span>

                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    System
                  </span>

                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    Operational
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

