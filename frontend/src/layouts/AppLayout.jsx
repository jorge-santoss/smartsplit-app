import { useAuth } from "../hooks/useAuth";
import { Link, useLocation } from "react-router";
import logoImg from "../assets/smartsplit-isotipo.png";
import Avatar from "../components/Avatar";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-bold text-teal-500">
            <img src={logoImg} alt="SmartSplit" className="h-8 w-auto inline-block mr-2" />
            SmartSplit
          </Link>
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} size="sm" className="bg-teal-100 text-teal-700" />
            <span className="text-sm text-gray-600">{user?.name}</span>
                       {pathname !== '/dashboard' && (
              <Link
                to="/dashboard"
                className="text-sm text-gray-600 hover:text-teal-500 transition-colors"
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/settings"
              className={`text-sm hover:text-gray-900 ${pathname === '/settings' ? 'text-teal-500 font-semibold' : 'text-gray-600'}`}
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