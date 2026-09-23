import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "./components/layout/PublicLayout";
import { AuthLayout } from "./components/layout/AuthLayout";
import { DiscoverPage } from "./pages/DiscoverPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { ProtectedRoute } from "./features/auth/protectedRoute";
import { useAuthInit } from "./features/auth/hooks/useAuthInit";
import { Toaster } from "react-hot-toast";
import { StadiumDetailPage } from "./pages/StadiumDetailPage";
import { MapPage } from "./pages/ MapPage";
import { BookingPage } from "./pages/BookingsPage";
import { PlayerDashboardPage } from "./pages/PlayerDashboardPage";
import { OwnerDashboardPage } from "./pages/OwnerDashboardPage";
import { OwnerStadiumPhotosPage } from "./pages/OwnerStadiumPhotosPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { PlayerBookingsPage } from "./pages/PlayerBookingsPage";
import { ProfilePage } from "./pages/ProfilePage";

export function App() {
  useAuthInit();
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/forgot-password"
            element={<ComingSoonPage title="Forgot password" />}
          />
        </Route>

        <Route element={<PublicLayout />}>
          <Route path="/" element={<DiscoverPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route
            element={<ProtectedRoute allowedRoles={["PLAYER", "OWNER"]} />}
          >
            <Route path="/map" element={<MapPage />} />
            <Route element={<ProtectedRoute allowedRoles={["PLAYER"]} />}>
              <Route path="/dashboard" element={<PlayerDashboardPage />} />
            </Route>
            <Route
              path="/stadiums/:stadiumId"
              element={<StadiumDetailPage />}

            />
            <Route path="/bookings/:stadiumId" element={<BookingPage />} />
            <Route element={<ProtectedRoute allowedRoles={["PLAYER"]} />}>
              <Route path="/bookings" element={<PlayerBookingsPage />} />
            </Route>
            <Route
              path="/messages"
              element={<ComingSoonPage title="Messages" />}
            />
            <Route
              path="/notifications"
              element={<ComingSoonPage title="Notifications" />}
            />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["OWNER"]} />}>
            <Route path="/owner" element={<OwnerDashboardPage />} />
            <Route path="/owner/photos" element={<OwnerStadiumPhotosPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route
              path="/admin"
              element={<ComingSoonPage title="Admin Dashboard" />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
