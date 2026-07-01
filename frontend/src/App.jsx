import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useAuth } from "./hooks/useAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import HouseholdPage from "./pages/HouseholdPage";
import ExpenseDetailPage from "./pages/ExpenseDetailPage";
import SettingsPage from "./pages/SettingsPage";
import LandingPage from "./pages/LandingPage";
import { AuthProvider } from "./context/AuthProvider";

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCEA3C]" />
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { token } = useAuth();
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route
              path="/"
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/households/:id"
              element={
                <ProtectedRoute>
                  <HouseholdPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-[#121212]">
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-8 max-w-md mx-auto text-center">
                    <p className="text-xl text-gray-400">Page not found</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}