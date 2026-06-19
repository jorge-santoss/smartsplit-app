import { useAuth } from "../hooks/useAuth";
import { Link, useLocation } from "react-router";
import logoImg from "../assets/SmartSplit-logo-app.png";
import Avatar from "../components/Avatar";
import {Settings} from "lucide-react";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-[#E1EEE8]">
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b border-white/80 shadow-[0_4px_20px_-8px_rgba(21,69,53,0.05)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center text-xl font-bold text-[#154535]">
            <img src={logoImg} alt="SmartSplit" className="h-8 w-auto inline-block mr-2" />
            SmartSplit
          </Link>
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} size="sm" className="bg-[#E1EEE8] text-[#154535]" />
            <span className="text-sm font-medium text-[#4A6B5D]">{user?.name}</span>
            {pathname !== '/dashboard' && (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-[#4A6B5D] hover:text-[#154535] transition-colors"
              >
                Dashboard
              </Link>
            )}
           <Link
  to="/settings"
  className={`text-sm font-medium transition-colors ${pathname === '/settings' ? 'text-[#154535] font-semibold' : 'text-[#4A6B5D] hover:text-[#154535]'}`}
>
  <Settings className="w-5 h-5" title="Settings" />
</Link>
            <button
              onClick={logout}
              className="text-sm font-medium text-[#D94A4A] hover:text-red-700 transition-colors"
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