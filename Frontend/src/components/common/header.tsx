
import { useState } from "react";
import { NavLink } from "react-router";

import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/rooms", label: "Rooms" },
  { to: "/reservations", label: "Reservations" },
  { to: "/reservations/create", label: "Reserve a Room" },
];

export function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="bg-[#071426] border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden">
              <img
                src="/CPC.png"
                alt="Cordova Public College Logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-lg font-bold text-white">
                Cordova Public College
              </h1>

              <p className="text-xs text-slate-400">
                Room Reservation System
              </p>
            </div>
          </NavLink>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-6">
            <NavLink
              to="/reservations/create"
              className="hidden md:inline-block text-sm font-medium text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              Reserve Now
            </NavLink>

            {user ? (
              <>
                <span className="hidden lg:inline text-xs text-slate-300">
                  {user.section_label}
                </span>

                <button
                  type="button"
                  onClick={() => void logout()}
                  className="hidden md:inline-block text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/admin/login"
                className="hidden md:inline-block text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Login
              </NavLink>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <span className="sr-only">Menu</span>

              <span
                className={`block h-0.5 w-5 bg-current transition-transform duration-200 ${
                  menuOpen
                    ? "rotate-45 translate-y-0.5"
                    : "-translate-y-0.5"
                }`}
              />

              <span
                className={`block h-0.5 w-5 bg-current transition-opacity duration-200 ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />

              <span
                className={`block h-0.5 w-5 bg-current transition-transform duration-200 ${
                  menuOpen
                    ? "-rotate-45 -translate-y-1"
                    : "translate-y-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            className="md:hidden border-t border-slate-800 py-3 space-y-1"
            onClick={closeMenu}
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="block text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
              >
                {link.label}
              </NavLink>
            ))}

            <div className="border-t border-slate-800 my-2" />

            {user ? (
              <div className="px-3 py-2 space-y-2">
                <p className="text-xs text-slate-400">
                  {user.section_label}
                </p>

                <button
                  type="button"
                  onClick={() => void logout()}
                  className="block text-sm font-medium text-slate-300 hover:text-white rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <NavLink
                to="/admin/login"
                className="block text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
              >
                Login
              </NavLink>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

