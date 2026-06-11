import { useAuth } from "../hooks/useAuth";
import { Link, useLocation } from "react-router";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold text-blue-600">
            SmartSplit
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Link
              to="/settings"
              className={`text-sm hover:text-gray-900 ${pathname === '/settings' ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}
            >
              Settings
            </Link>
            <button
              onClick={logout}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}