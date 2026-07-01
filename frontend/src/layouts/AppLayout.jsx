import { useAuth } from "../hooks/useAuth";
import { Link, useLocation } from "react-router";
import logoImg from "../assets/smartsplit_logo.png";
import Avatar from "../components/Avatar";
import {Settings} from "lucide-react";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-[#121212]">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#121212]/80 border-b border-white/10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center text-xl font-bold text-[#FCEA3C]">
            <img src={logoImg} alt="SmartSplit" className="h-8 w-auto inline-block mr-2" />
            SmartSplit
          </Link>
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} size="sm" className="bg-white/10 text-[#FCEA3C]" />
            <span className="text-sm font-medium text-gray-400">{user?.name}</span>
            {pathname !== '/dashboard' && (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-gray-400 hover:text-[#FCEA3C] transition-colors"
              >
                Dashboard
              </Link>
            )}
           <Link
  to="/settings"
  className={`text-sm font-medium transition-colors ${pathname === '/settings' ? 'text-[#FCEA3C]' : 'text-gray-400 hover:text-[#FCEA3C]'}`}
>
  <Settings className="w-5 h-5" title="Settings" />
</Link>
            <button
              onClick={logout}
              className="text-sm font-medium text-[#FF6B6B] hover:text-red-400 transition-colors"
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