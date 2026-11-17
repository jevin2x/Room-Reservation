
import { NavLink } from "react-router";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-lg font-bold mb-3">
              Cordova Public College
            </h2>

            <p className="text-sm text-slate-400 max-w-sm">
              A simple and efficient room reservation system for managing
              school facilities and reservations.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">
              Quick Links
            </h3>

            <nav className="flex flex-col gap-2">
              <NavLink
                to="/"
                className="text-sm text-slate-400 hover:text-white"
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/rooms"
                className="text-sm text-slate-400 hover:text-white"
              >
                Rooms
              </NavLink>

              <NavLink
                to="/reservations"
                className="text-sm text-slate-400 hover:text-white"
              >
                Reservations
              </NavLink>

              <NavLink
                to="/reservations/create"
                className="text-sm text-slate-400 hover:text-white"
              >
                Reserve a Room
              </NavLink>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">
              System
            </h3>

            <p className="text-sm text-slate-400">
              School Room Reservation System
            </p>

            <p className="text-sm text-slate-500 mt-2">
              Manage rooms. Reserve spaces. Avoid conflicts.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6">
          <p className="text-sm text-slate-500 text-center">
            © {new Date().getFullYear()} Cordova Public College. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

