import "@/styles/global.css";

import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/lib/auth";

import DashboardPage from "@/pages/guest/dashboard";
import RoomsPage from "@/components/features/rooms";
import ReservationsPage from "@/pages/guest/reservation";
import ReservationCreatePage from "@/pages/guest/reservation/create";
import AboutPage from "@/pages/guest/about";

import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminLoginPage from "@/pages/admin/login";
import AdminRegisterPage from "@/pages/admin/register";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<AdminLoginPage />}
        />

        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        <Route
          path="/admin/login"
          element={<AdminLoginPage />}
        />

        <Route
          path="/admin/register"
          element={<AdminRegisterPage />}
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rooms"
          element={<RoomsPage />}
        />

        <Route
          path="/about"
          element={<AboutPage />}
        />

        <Route
          path="/reservations"
          element={
            <ProtectedRoute>
              <ReservationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reservations/create"
          element={
            <ProtectedRoute>
              <ReservationCreatePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </AuthProvider>,
);