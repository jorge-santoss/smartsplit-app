import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useAuth } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HouseholdPage from './pages/HouseholdPage';
import ExpenseDetailPage from './pages/ExpenseDetailPage';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/login" replace />;
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
      <ErrorBoundary>
      <Routes>
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
          path="/households/:householdId/expenses/:expenseId"
          element={
            <ProtectedRoute>
              <ExpenseDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <p className="text-xl text-gray-500">Page not found</p>
            </div>
          }
        />
      </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
